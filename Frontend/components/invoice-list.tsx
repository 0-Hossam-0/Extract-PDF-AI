'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InvoiceModal } from './invoice-modal';
import axios from 'axios';
import { InvoiceData } from '@/types/invoice.type';
import { API_URL } from '@/environment/environment';

export function InvoiceList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/invoices?search=${searchQuery}`,{
        // withCredentials: true
      });
      console.log(res.data);
      setInvoices(res.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = async (fileId: string) => {
    const response = await axios.delete(`${API_URL}/invoices/${fileId}`);
    if (response.status === 200) {
      setInvoices(invoices.filter((inv) => inv.fileId !== fileId));
    } else {
      alert('Failed to delete invoice.');
    }
  };

  const handleEditInvoice = (invoice: InvoiceData) => {
    setSelectedInvoice(invoice);

    setIsEditModalOpen(true);
  };

  const handleUpdateInvoice = (data: InvoiceData) => {
    const updatedInvoices = invoices.map((invoice) => (invoice.fileId === data.fileId ? data : invoice));
    setInvoices(updatedInvoices);
    setIsNewModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Invoice Management</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-64 bg-gray-500 text-white"
                />
                <Button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()} size="sm">
                  {isLoading ? (
                    'Searching...'
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              {/* <Button onClick={handleNewInvoice} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button> */}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-black">
                  {isLoading ? 'Loading...' : 'No invoices found. Try searching for something else.'}
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.fileId}>
                  <TableCell>{invoice.invoice.number}</TableCell>
                  <TableCell>{invoice.vendor.name}</TableCell>
                  <TableCell>{formatDate(invoice.invoice.date)}</TableCell>
                  <TableCell>{formatCurrency(invoice.invoice.total || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.invoice.total ? 'default' : 'secondary'}>
                      {invoice.invoice.total ? 'Paid' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditInvoice(invoice)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDelete(invoice.fileId)} variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <InvoiceModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleUpdateInvoice}
        data={null}
        title={''}
      />

      {selectedInvoice && (
        <InvoiceModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateInvoice}
          data={selectedInvoice}
          title={''}
        />
      )}
    </div>
  );
}
