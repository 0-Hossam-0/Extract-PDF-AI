'use client';

import type React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Zap } from 'lucide-react';
import { PDFViewer } from './pdf-viewer';
import { InvoiceForm } from './invoice-form';
import { InvoiceList } from './invoice-list';
import axios from 'axios';
import { API_URL } from '@/environment/environment';

export function PDFDashboard() {
  const [activeTab, setActiveTab] = useState('viewer');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'groq'>('gemini');
  const [fileId, setFileId] = useState<string>('');
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const responseData = res.data;
      setFileId(responseData.fileId);
      setUploadedFile(file);
    }
  };

  const resetUploadedFile = () => {
    setUploadedFile(null);
    setExtractedData(null);
    setFileId('');
  };

  const handleExtractData = async () => {
    if (!uploadedFile) return;

    setIsExtracting(true);

    try {
      const res = await axios.post(`${API_URL}/extract`, {
        model: selectedModel,
        fileId: fileId,
      });

      setExtractedData(res.data.invoice);
    } catch (err: any) {
      console.error(err);
      alert('Something went wrong while extracting PDF data.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">PDF Invoice Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="viewer">PDF Viewer & Extraction</TabsTrigger>
            <TabsTrigger value="invoices">Invoice Management</TabsTrigger>
          </TabsList>

          <TabsContent value="viewer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>PDF Viewer</span>
                    <div className="flex items-center space-x-2">
                      <Input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="pdf-upload" />
                      <Label htmlFor="pdf-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload PDF
                          </span>
                        </Button>
                      </Label>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <PDFViewer file={uploadedFile} />
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Invoice Data</span>
                    <div className="flex items-center space-x-2">
                      <Select
                        defaultValue="gemini"
                        onValueChange={(value) => setSelectedModel(value as 'gemini' | 'groq')}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini">Gemini</SelectItem>
                          <SelectItem value="groq">Groq</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleExtractData} disabled={!uploadedFile || isExtracting} size="sm">
                        <Zap className="h-4 w-4 mr-2" />
                        {isExtracting ? 'Extracting...' : 'Extract'}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <InvoiceForm
                    data={extractedData}
                    onSave={(data: any) => console.log('Saving:', data)}
                    isLoading={isExtracting}
                    resetUploadedFile={resetUploadedFile}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="invoices">
            <InvoiceList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
