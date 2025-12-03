import { DashboardLayout } from "../../components/dashboard-layout";
import { DashboardHeader } from "../../components/dashboard-header";
import { PrintButton } from "@/components/print-button";

async function getInvoice(id: string) {
    const res = await fetch(`http://localhost:3001/api/invoices/${id}`, {
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error("Failed to fetch invoice");
    }
    return res.json();
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const invoice = await getInvoice(id);

    return (
        <DashboardLayout>
            <DashboardHeader />
            <main className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2 print:hidden">
                    <h2 className="text-3xl font-bold tracking-tight">Invoice Details</h2>
                    <div className="flex items-center space-x-2">
                        <PrintButton />
                    </div>
                </div>

                <div className="bg-white p-8 shadow-sm border rounded-lg max-w-4xl mx-auto print:shadow-none print:border-0">
                    {/* Header */}
                    <div className="flex justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">{invoice.issuer_name}</h1>
                            <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.issuer_address}</p>
                            <p className="text-sm text-gray-600 mt-2">Tax ID: {invoice.issuer_tax_id}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-800">TAX INVOICE</h2>
                            <h3 className="text-lg text-gray-600">ใบกำกับภาษี</h3>
                            <div className="mt-4">
                                <p><strong>No:</strong> {invoice.invoice_no}</p>
                                <p><strong>Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Customer */}
                    <div className="mb-8 border-t border-b py-4">
                        <h3 className="font-bold mb-2">Customer / ลูกค้า:</h3>
                        <p className="font-semibold">{invoice.customer_name}</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.customer_address}</p>
                        <p className="text-sm text-gray-600 mt-1">Tax ID: {invoice.customer_tax_id}</p>
                    </div>

                    {/* Items */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-2">Description / รายการ</th>
                                <th className="text-right py-2 w-40">Amount / จำนวนเงิน</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="py-4">{invoice.description}</td>
                                <td className="text-right py-4">
                                    {invoice.amount_vatable.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                            {/* Spacer rows to fill page if needed */}
                            <tr className="h-24"><td></td><td></td></tr>
                        </tbody>
                        <tfoot className="border-t-2 border-gray-200">
                            <tr>
                                <td className="text-right py-2 font-semibold">Total Amount / รวมเงิน</td>
                                <td className="text-right py-2">
                                    {invoice.amount_vatable.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                            <tr>
                                <td className="text-right py-2 font-semibold">VAT 7% / ภาษีมูลค่าเพิ่ม</td>
                                <td className="text-right py-2">
                                    {invoice.amount_vat.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                            <tr className="text-lg font-bold">
                                <td className="text-right py-2">Grand Total / จำนวนเงินรวมทั้งสิ้น</td>
                                <td className="text-right py-2">
                                    {invoice.amount_total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Footer */}
                    <div className="grid grid-cols-2 gap-8 mt-12">
                        <div className="text-center">
                            <div className="border-b border-gray-400 w-3/4 mx-auto mb-2 h-24"></div>
                            <p>Received By / ผู้รับวางบิล</p>
                            <p className="text-sm text-gray-500">Date / วันที่: ________________</p>
                        </div>
                        <div className="text-center">
                            <div className="border-b border-gray-400 w-3/4 mx-auto mb-2 h-24"></div>
                            <p>Authorized Signature / ผู้มีอำนาจลงนาม</p>
                            <p className="text-sm text-gray-500">Date / วันที่: ________________</p>
                        </div>
                    </div>
                </div>
            </main>
        </DashboardLayout>
    );
}
