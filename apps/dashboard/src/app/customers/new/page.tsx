"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "../../components/dashboard-layout";
import { DashboardHeader } from "../../components/dashboard-header";

export default function NewCustomerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error("Failed to create customer");
            }

            router.push("/customers");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to create customer");
        } finally {
            setLoading(false);
        }
    }

    return (
        <DashboardLayout>
            <DashboardHeader />
            <main className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">New Customer</h2>
                </div>
                <div className="max-w-2xl">
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Company Name (Thai)</Label>
                                <Input id="name" name="name" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name_en">Company Name (English)</Label>
                                <Input id="name_en" name="name_en" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tax_id">Tax ID</Label>
                            <Input id="tax_id" name="tax_id" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Address (Thai)</Label>
                                <Textarea id="address" name="address" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address_en">Address (English)</Label>
                                <Textarea id="address_en" name="address_en" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="branch">Branch</Label>
                                <Input id="branch" name="branch" placeholder="Head Office" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tel">Tel</Label>
                                <Input id="tel" name="tel" />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Creating..." : "Create Customer"}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </DashboardLayout>
    );
}
