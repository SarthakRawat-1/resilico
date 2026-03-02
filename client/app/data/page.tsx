"use client";

import React, { useState } from "react";
import { useCommunityData } from "@/lib/useCommunityData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BouncyCard } from "@/components/ui/bouncy-card";
import { FadeInRow } from "@/components/ui/fade-in-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cfssApi, MemberCreate, ExposureCreate } from "@/lib/api";
import { Users, Wallet, Plus, Trash2, Pencil, X, Loader2 } from "lucide-react";
import { useTutorial } from "@/hooks/useTutorial";

export default function DataHubPage() {
    const { members, exposures, fetchAll, isLoading } = useCommunityData();
    const [activeTab, setActiveTab] = useState("members");
    const { startTutorial } = useTutorial();

    React.useEffect(() => {
        if (!isLoading) {
            startTutorial();
        }
    }, [isLoading, startTutorial]);
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [showExposureForm, setShowExposureForm] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
    const [editingExposureId, setEditingExposureId] = useState<number | null>(null);

    const defaultMemberForm: MemberCreate = {
        name: "", monthly_income: 30000, monthly_expenses: 20000,
        emergency_reserve: 50000, trust_score: 0.5, risk_score: 0.3,
    };
    const defaultExposureForm: ExposureCreate = {
        lender_id: 0, borrower_id: 0, exposure_amount: 10000, repayment_probability: 0.9,
    };

    const [memberForm, setMemberForm] = useState<MemberCreate>(defaultMemberForm);
    const [exposureForm, setExposureForm] = useState<ExposureCreate>(defaultExposureForm);

    const handleEditMember = (m: typeof members[0]) => {
        setEditingMemberId(m.id);
        setMemberForm({
            name: m.name,
            monthly_income: m.monthly_income,
            monthly_expenses: m.monthly_expenses,
            emergency_reserve: m.emergency_reserve,
            trust_score: m.trust_score,
            risk_score: m.risk_score,
        });
        setShowMemberForm(true);
    };

    const handleCancelMemberEdit = () => {
        setEditingMemberId(null);
        setMemberForm(defaultMemberForm);
        setShowMemberForm(false);
    };

    const handleSubmitMember = async () => {
        try {
            if (editingMemberId !== null) {
                await cfssApi.updateMember(editingMemberId, memberForm);
                setEditingMemberId(null);
            } else {
                await cfssApi.createMember(memberForm);
            }
            setShowMemberForm(false);
            setMemberForm(defaultMemberForm);
            await fetchAll();
        } catch (err) { console.error(err); }
    };

    const handleDeleteMember = async (id: number) => {
        setDeleting(id);
        try {
            await cfssApi.deleteMember(id);
            await fetchAll();
        } catch (err) { console.error(err); }
        setDeleting(null);
    };

    const handleEditExposure = (e: typeof exposures[0]) => {
        setEditingExposureId(e.id);
        setExposureForm({
            lender_id: e.lender_id,
            borrower_id: e.borrower_id,
            exposure_amount: e.exposure_amount,
            repayment_probability: e.repayment_probability,
        });
        setShowExposureForm(true);
    };

    const handleCancelExposureEdit = () => {
        setEditingExposureId(null);
        setExposureForm(defaultExposureForm);
        setShowExposureForm(false);
    };

    const handleSubmitExposure = async () => {
        try {
            if (editingExposureId !== null) {
                await cfssApi.updateExposure(editingExposureId, exposureForm);
                setEditingExposureId(null);
            } else {
                await cfssApi.createExposure(exposureForm);
            }
            setShowExposureForm(false);
            setExposureForm(defaultExposureForm);
            await fetchAll();
        } catch (err) { console.error(err); }
    };

    const handleDeleteExposure = async (id: number) => {
        setDeleting(id);
        try {
            await cfssApi.deleteExposure(id);
            await fetchAll();
        } catch (err) { console.error(err); }
        setDeleting(null);
    };

    const memberFormIsEditing = editingMemberId !== null;
    const exposureFormIsEditing = editingExposureId !== null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Data Hub</h1>
                <p className="text-gray-500 font-bold mt-2 text-lg">Manage community members and loan exposures</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="data-tabs-section w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-2 rounded-2xl mb-6 shadow-inner h-16">
                    <TabsTrigger
                        value="members"
                        className="rounded-xl text-lg font-bold text-gray-500 data-[state=active]:bg-white data-[state=active]:text-secondary data-[state=active]:shadow-sm transition-all"
                    >
                        <Users className="w-5 h-5 mr-3" /> Members ({members.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="exposures"
                        className="tab-loans rounded-xl text-lg font-bold text-gray-500 data-[state=active]:bg-white data-[state=active]:text-warning data-[state=active]:shadow-sm transition-all"
                    >
                        <Wallet className="w-5 h-5 mr-3" /> Loans ({exposures.length})
                    </TabsTrigger>
                </TabsList>

                {/* Members */}
                <TabsContent value="members">
                    <BouncyCard delay={0.1}>
                        <Card className="border-4 border-gray-200 overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b-2 border-gray-100 pb-4">
                                <CardTitle className="text-2xl text-gray-800">Community Members</CardTitle>
                                <Button
                                    variant="secondary"
                                    size="default"
                                    onClick={() => {
                                        if (showMemberForm) { handleCancelMemberEdit(); }
                                        else { setEditingMemberId(null); setMemberForm(defaultMemberForm); setShowMemberForm(true); }
                                    }}
                                    className="add-member-btn shadow-sm"
                                >
                                    {showMemberForm ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                                    {showMemberForm ? "CANCEL" : "ADD MEMBER"}
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {showMemberForm && (
                                    <div className="add-member-form m-6 p-6 rounded-2xl bg-secondary/10 border-2 border-secondary/20 space-y-4 shadow-inner">
                                        {memberFormIsEditing && (
                                            <p className="text-sm font-black text-secondary uppercase tracking-wider">
                                                Editing Member #{editingMemberId}
                                            </p>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-xs text-secondary-dark font-black uppercase tracking-wider mb-2">Name</label>
                                                <input type="text" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-secondary/20 text-gray-800 font-bold focus:outline-none focus:border-secondary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-secondary-dark font-black uppercase tracking-wider mb-2">Monthly Income</label>
                                                <input type="number" value={memberForm.monthly_income} onChange={(e) => setMemberForm({ ...memberForm, monthly_income: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-secondary/20 text-gray-800 font-bold focus:outline-none focus:border-secondary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-secondary-dark font-black uppercase tracking-wider mb-2">Monthly Expenses</label>
                                                <input type="number" value={memberForm.monthly_expenses} onChange={(e) => setMemberForm({ ...memberForm, monthly_expenses: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-secondary/20 text-gray-800 font-bold focus:outline-none focus:border-secondary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-secondary-dark font-black uppercase tracking-wider mb-2">Emergency Reserve</label>
                                                <input type="number" value={memberForm.emergency_reserve} onChange={(e) => setMemberForm({ ...memberForm, emergency_reserve: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-secondary/20 text-gray-800 font-bold focus:outline-none focus:border-secondary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-secondary-dark font-black uppercase tracking-wider mb-2">Trust Score (0-1)</label>
                                                <input type="number" value={memberForm.trust_score} onChange={(e) => setMemberForm({ ...memberForm, trust_score: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-secondary/20 text-gray-800 font-bold focus:outline-none focus:border-secondary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-secondary-dark font-black uppercase tracking-wider mb-2">Risk Score (0-1)</label>
                                                <input type="number" value={memberForm.risk_score} onChange={(e) => setMemberForm({ ...memberForm, risk_score: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-secondary/20 text-gray-800 font-bold focus:outline-none focus:border-secondary" />
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <Button variant="primary" size="lg" onClick={handleSubmitMember} className="shadow-sm">
                                                {memberFormIsEditing ? "SAVE CHANGES" : "CREATE MEMBER"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-base text-left">
                                        <thead className="text-xs text-gray-400 font-black uppercase tracking-wider bg-gray-50 border-b-2 border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4">Name</th>
                                                <th className="px-6 py-4">Income</th>
                                                <th className="px-6 py-4">Expenses</th>
                                                <th className="px-6 py-4">Reserve</th>
                                                <th className="px-6 py-4">Risk</th>
                                                <th className="px-6 py-4">Health</th>
                                                <th className="px-6 py-4 w-28"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y-2 divide-gray-100">
                                            {members.map((m, index) => {
                                                const h = m.emergency_reserve / (m.monthly_expenses || 1);
                                                return (
                                                    <FadeInRow key={m.id} delay={index * 0.05} className="text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <span className="font-extrabold text-gray-900 block">{m.name}</span>
                                                            <span className="block text-xs text-gray-400 font-black mt-1">ID: {m.id}</span>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-primary">${m.monthly_income.toLocaleString()}</td>
                                                        <td className="px-6 py-4 font-mono text-danger">${m.monthly_expenses.toLocaleString()}</td>
                                                        <td className="px-6 py-4 font-mono font-black text-secondary-dark">${m.emergency_reserve.toLocaleString()}</td>
                                                        <td className="px-6 py-4 font-mono">{(m.risk_score * 100).toFixed(0)}%</td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant={h > 3 ? "primary" : h > 1.5 ? "warning" : "danger"} className="shadow-none">
                                                                {h > 3 ? "Healthy" : h > 1.5 ? "Warning" : "At Risk"}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => handleEditMember(m)}
                                                                    className="p-2 rounded-xl text-gray-400 hover:text-secondary hover:bg-secondary/10 transition-all border-2 border-transparent hover:border-secondary/20"
                                                                >
                                                                    <Pencil className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteMember(m.id)}
                                                                    disabled={deleting === m.id}
                                                                    className="p-2 rounded-xl text-gray-400 hover:text-danger hover:bg-danger/10 transition-all border-2 border-transparent hover:border-danger/20"
                                                                >
                                                                    {deleting === m.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </FadeInRow>
                                                );
                                            })}
                                            {members.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-bold">No members found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </BouncyCard>
                </TabsContent>

                {/* Exposures */}
                <TabsContent value="exposures">
                    <BouncyCard delay={0.1}>
                        <Card className="border-4 border-gray-200 overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b-2 border-gray-100 pb-4">
                                <CardTitle className="text-2xl text-gray-800">Active Loans & Exposures</CardTitle>
                                <Button
                                    variant="warning"
                                    size="default"
                                    onClick={() => {
                                        if (showExposureForm) { handleCancelExposureEdit(); }
                                        else { setEditingExposureId(null); setExposureForm(defaultExposureForm); setShowExposureForm(true); }
                                    }}
                                    className="add-exposure-btn shadow-sm"
                                >
                                    {showExposureForm ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                                    {showExposureForm ? "CANCEL" : "ADD LOAN"}
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {showExposureForm && (
                                    <div className="add-exposure-form m-6 p-6 rounded-2xl bg-warning/10 border-2 border-warning/20 space-y-4 shadow-inner">
                                        {exposureFormIsEditing && (
                                            <p className="text-sm font-black text-warning-dark uppercase tracking-wider">
                                                Editing Loan #{editingExposureId}
                                            </p>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <div>
                                                <label className="block text-xs text-warning-dark font-black uppercase tracking-wider mb-2">Lender ID</label>
                                                <input type="number" value={exposureForm.lender_id} onChange={(e) => setExposureForm({ ...exposureForm, lender_id: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-warning/20 text-gray-800 font-bold focus:outline-none focus:border-warning" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-warning-dark font-black uppercase tracking-wider mb-2">Borrower ID</label>
                                                <input type="number" value={exposureForm.borrower_id} onChange={(e) => setExposureForm({ ...exposureForm, borrower_id: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-warning/20 text-gray-800 font-bold focus:outline-none focus:border-warning" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-warning-dark font-black uppercase tracking-wider mb-2">Amount</label>
                                                <input type="number" value={exposureForm.exposure_amount} onChange={(e) => setExposureForm({ ...exposureForm, exposure_amount: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-warning/20 text-gray-800 font-bold focus:outline-none focus:border-warning" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-warning-dark font-black uppercase tracking-wider mb-2">Repay Prob (0-1)</label>
                                                <input type="number" value={exposureForm.repayment_probability} onChange={(e) => setExposureForm({ ...exposureForm, repayment_probability: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-warning/20 text-gray-800 font-bold focus:outline-none focus:border-warning" />
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <Button variant="primary" size="lg" onClick={handleSubmitExposure} className="shadow-sm">
                                                {exposureFormIsEditing ? "SAVE CHANGES" : "CREATE LOAN"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-base text-left">
                                        <thead className="text-xs text-gray-400 font-black uppercase tracking-wider bg-gray-50 border-b-2 border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4">ID</th>
                                                <th className="px-6 py-4">Lender</th>
                                                <th className="px-6 py-4">Borrower</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Repay Prob</th>
                                                <th className="px-6 py-4 w-28"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y-2 divide-gray-100">
                                            {exposures.map((e, index) => {
                                                const lender = members.find((m) => m.id === e.lender_id);
                                                const borrower = members.find((m) => m.id === e.borrower_id);
                                                return (
                                                    <FadeInRow key={e.id} delay={index * 0.05} className="text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-gray-400 font-black font-mono">{e.id}</td>
                                                        <td className="px-6 py-4 font-extrabold text-secondary">{lender?.name || `#${e.lender_id}`}</td>
                                                        <td className="px-6 py-4 font-extrabold text-danger">{borrower?.name || `#${e.borrower_id}`}</td>
                                                        <td className="px-6 py-4 font-mono font-black text-gray-800">${e.exposure_amount.toLocaleString()}</td>
                                                        <td className="px-6 py-4 font-mono">{(e.repayment_probability * 100).toFixed(0)}%</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => handleEditExposure(e)}
                                                                    className="p-2 rounded-xl text-gray-400 hover:text-warning-dark hover:bg-warning/10 transition-all border-2 border-transparent hover:border-warning/20"
                                                                >
                                                                    <Pencil className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteExposure(e.id)}
                                                                    disabled={deleting === e.id}
                                                                    className="p-2 rounded-xl text-gray-400 hover:text-danger hover:bg-danger/10 transition-all border-2 border-transparent hover:border-danger/20"
                                                                >
                                                                    {deleting === e.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </FadeInRow>
                                                );
                                            })}
                                            {exposures.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-bold">No exposures found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </BouncyCard>
                </TabsContent>
            </Tabs>
        </div>
    );
}
