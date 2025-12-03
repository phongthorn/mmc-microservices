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

async function getCustomers() {
    const res = await fetch("http://localhost:3001/api/customers", {
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error("Failed to fetch customers");
    }
    return res.json();
}

export default async function CustomersPage() {
    const customers = await getCustomers();

    return (
        <DashboardLayout>
            <DashboardHeader />
            <main className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                    <div className="flex items-center space-x-2">
                        <Link href="/customers/new">
                            <Button>New Customer</Button>
                        </Link>
                    </div>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Tax ID</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Tel</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map((customer: any) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.tax_id}</TableCell>
                                    <TableCell>{customer.address}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>{customer.tel}</TableCell>
                                </TableRow>
                            ))}
                            {customers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No customers found.
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
