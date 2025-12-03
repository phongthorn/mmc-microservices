import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DashboardLayout } from "../components/dashboard-layout";
import { DashboardHeader } from "../components/dashboard-header";

async function getInvoices() {
    const res = await fetch("http://localhost:3001/api/invoices", {
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error("Failed to fetch invoices");
    }
    return res.json();
}

export default async function InvoicesPage() {
    const invoices = await getInvoices();

    return (
        <DashboardLayout>
            <DashboardHeader />
            <main className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
                    <div className="flex items-center space-x-2">
                        <Link href="/invoices/new">
                            <Button>New Invoice</Button>
                        </Link>
                    </div>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice No</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice: any) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.invoice_no}</TableCell>
                                    <TableCell>{invoice.invoice_date}</TableCell>
                                    <TableCell>{invoice.customer_name}</TableCell>
                                    <TableCell>{invoice.description}</TableCell>
                                    <TableCell className="text-right">
                                        {invoice.amount_total.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/invoices/${invoice.id}`}>
                                            <Button variant="ghost" size="sm">View</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {invoices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        No invoices found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
        </DashboardLayout>
    );
}
