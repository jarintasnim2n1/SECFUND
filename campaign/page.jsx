"use client";
import React, { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi';
import WhyFund from '@/app/Why/page';
import { useCrowdContract } from '@/app/web3/constant/CrowdContract';
import Createcampaign from '@/app/create/page';
import View from '@/app/view/page';
import { formatEther } from 'viem';
import EmergencyVotingView from '../Emergency/page';

const Campaign = () => {
    const { 
        campaignInfo,
        campaignInfoLoading,
        campaignInfoError,
        CreateCampaign, 
        donateToFunction, 
        triggerWithdrawalVote, 
        vote,
        finalizeVote,
        finalizeCampaign,
        withdrawFunds, 
        getRefund, 
        isLoading, 
        error,
        isConfirming,
        isConfirmed,
        refetchAll,
        totalCampaigns, 
        totalRaised,
        activeCampaign,
        successfulCampaign,
        userCampaign,
        userContributions
    } = useCrowdContract();
    
    const {address, isConnected} = useAccount();    
    const [mounted, setMounted] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [refundAmount, setRefundAmount] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showExploreModal, setShowExploreModal] = useState(false);
    const [selectedCampaignId, setSelectedCampaignId] = useState('');
    const [selectedRewardTierId, setSelectedRewardTierId] = useState('');
    const [donationAmount, setDonationAmount] = useState('');
    
    useEffect(() => {
        setMounted(true);
    }, []);
    
    useEffect(() => {
        if(isConfirmed){
            const timer = setTimeout(() => {
                refetchAll();
                setWithdrawalAmount('');
                setRefundAmount('');
            }, 2000);
            return () => {clearTimeout(timer);}
        }
    }, [isConfirmed, refetchAll]);
    
    const calculateStats = useMemo(() => {
        if(!campaignInfo || campaignInfo.length === 0){
            return {
                totalContributors: 0,
                failedCampaigns: 0,
            }
        }
        const totalContributors = campaignInfo.reduce((acc, campaign) => {
            return acc + (campaign.donators ? campaign.donators.length : 0);
        }, 0)
        const failedCampaigns = totalCampaigns - activeCampaign - successfulCampaign;
        
        return {
            totalContributors, 
            failedCampaigns
        }
    }, [campaignInfo, totalCampaigns, activeCampaign, successfulCampaign])
    
    // Voting campaigns
    const votingCampaigns = useMemo(() => {
        return campaignInfo?.filter(c => c.status === 1n) || [];
    }, [campaignInfo]);
    
    const NormalCampaigns = useMemo(() => {
        return campaignInfo?.filter(c => c.status !== 1n) || [];
    }, [campaignInfo]);
    
    const selectedCampaign = selectedCampaignId !== '' ? NormalCampaigns[parseInt(selectedCampaignId)] : null;
    
    // Calculate user-specific statistics
    const userSuccessfulCampaigns = userCampaign?.filter(c => c.status === 2n).length || 0;
    const userSuccessRate = userCampaign?.length > 0 ? (userSuccessfulCampaigns / userCampaign.length * 100).toFixed(1) : 0;
    const userActiveCampaignCount = userCampaign?.filter(c => c.status === 0n).length || 0;
    
    // Early return after all hooks
    if(!mounted) return null;  

    // Safe formatEther helper
    const safeFormatEther = (value) => {
        if (!value || value === null || value === undefined) return "0";
        try {
            const bigIntValue = typeof value === 'bigint' ? value : BigInt(value.toString());
            return formatEther(bigIntValue);
        } catch (error) {
            console.error("Error in safeFormatEther:", error, value);
            return "0";
        }
    };

    const handleTransactionSuccess = (message) => {
        alert(message);
    };

    const formatEthValue = (value) => {
        if(!value || value === null || value === undefined) return "0";
        try {
            // Ensure value is BigInt
            const bigIntValue = typeof value === 'bigint' ? value : BigInt(value);
            const formatted = formatEther(bigIntValue);
            return parseFloat(formatted).toFixed(4);
        } catch (error) {
            console.error("Error formatting eth value:", error, value);
            return "0";
        }
    }
    
    const handleDonate = () => {
        if (!selectedCampaignId || selectedRewardTierId === '' || !donationAmount || parseFloat(donationAmount) <= 0) {
            alert('Please fill in all fields correctly.');
            return;
        }

        try {
            const campaignIndex = parseInt(selectedCampaignId);
            const tierIndex = parseInt(selectedRewardTierId);
            
            if (isNaN(campaignIndex) || isNaN(tierIndex)) {
                alert('Invalid selection. Please try again.');
                return;
            }

            donateToFunction({
                campaignId: campaignIndex,
                rewardTierId: tierIndex,
                amountEth: donationAmount.toString(),
                onSuccess: handleDonationSuccess,
            });
        } catch (error) {
            console.error("Error in handleDonate:", error);
            alert('Failed to process donation. Please try again.');
        }
    }

    const handleDonationSuccess = () => {
        console.log("Donation transaction sent! Resetting form for next donation.");
        setSelectedCampaignId('');
        setSelectedRewardTierId('');
        setDonationAmount('');
    };

    // Handle withdraw with amount tracking
    const handleWithdraw = (campaignIndex) => {
        const campaign = campaignInfo[campaignIndex];
        if (!campaign) return;
        
        try {
            // Set the withdrawal amount to the collected amount
            const amount = safeFormatEther(campaign.collectedAmount);
            setWithdrawalAmount(amount);
            
            // Call the withdraw function
            withdrawFunds(campaignIndex, {
                onSuccess: () => handleTransactionSuccess("Withdrawal successful! Funds are on their way.")
            });
        } catch (error) {
            console.error("Error in handleWithdraw:", error);
            alert("Failed to process withdrawal. Please try again.");
        }
    };

    // Handle refund with amount tracking
    const handleRefund = (campaignIndex) => {
        const campaign = campaignInfo[campaignIndex];
        if (!campaign) return;
        
        try {
            // Find the user's contribution amount
            const donorIndex = campaign.donators?.findIndex(donor => 
                donor.toLowerCase() === address?.toLowerCase()
            );
            if (donorIndex === -1 || donorIndex === undefined) return;
            
            const amount = safeFormatEther(campaign.donations[donorIndex]);
            setRefundAmount(amount);
            
            // Call the refund function
            getRefund(campaignIndex, {
                onSuccess: () => handleTransactionSuccess("Refund successful! Check your wallet.")
            });
        } catch (error) {
            console.error("Error in handleRefund:", error);
            alert("Failed to process refund. Please try again.");
        }
    };

    return (
        <div>
            <div className='py-4'>
                {/* Hero section */}
                <div className='w-full bg-gradient-to-t from-teal-900 to-teal-700 shadow-xl text-white p-20 mb-8'>
                    <h1 className='text-2xl md:text-3xl font-bold mb-5 -mt-4'>
                        <span className='text-yellow-500 text-3xl font-bold'>SEC</span> 
                        <span className='text-rose-900 text-3xl font-bold'>FUND</span> MarketPlace!
                    </h1>
                    <p className='text-xl mb-8 text-teal-100'>Discover amazing projects, support innovative ideas, or launch your SecFunding campaign.</p>
                    <div className='flex flex-wrap gap-4'>
                        <button 
                            className='bg-white rounded-md ring-2 font-bold focus:outline-none outline-none text-teal-500 py-3 px-6 hover:bg-teal-500 hover:text-white hover:ring hover:ring-teal-600 transition-colors duration-300 shadow-lg' 
                            onClick={() => setShowCreateModal(true)} 
                            disabled={!isConnected}
                        >
                            Create Campaign
                        </button>
                        <button 
                            className='bg-teal-500 rounded-md font-bold text-white py-3 px-6 hover:bg-teal-700 ring-2 ring-teal-600 transition-colors duration-300 shadow-lg' 
                            onClick={() => setShowExploreModal(true)} 
                            disabled={!isConnected}
                        >
                            Explore Campaigns
                        </button>
                    </div>
                </div>
            
                {/* Platform statistics */}
                <div className='mb-1 mx-7'>
                    <h1 className='text-yellow-600 text-4xl font-bold text-center mb-6'>Platform Statistics</h1>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-20 items-center justify-center px-2'>
                        <div className='bg-gray-900/40 rounded-md shadow-2xl ring-2 ring-teal-900 mt-5 mb-8 p-6 w-[60%]'>
                            <div className='flex gap-10'>
                                <div>
                                    <h2 className='text-2xl font-bold text-gray-100 text-start mb-2'>Total Campaign</h2>
                                    <p className='text-5xl text-green-700 font-bold text-start'>{campaignInfoLoading ? "..." : totalCampaigns || 0}</p>
                                </div>
                                <div className='mt-5'>
                                    <span className='text-5xl'>🧿</span>
                                </div>
                            </div>
                            <p>📉 <span className="text-gray-400">50% vs last month</span></p>
                        </div>

                        <div className='bg-gray-900/40 rounded-md shadow-2xl ring-2 ring-teal-900 mt-5 mb-8 p-5 w-[60%]'>
                            <div className='flex gap-10 mb-2'>
                                <div>
                                    <h2 className='text-2xl font-bold text-gray-100 text-start mb-2'>Total Raised</h2>
                                    <p className='text-5xl text-green-700 font-bold text-start'>{campaignInfoLoading ? "..." : formatEthValue(totalRaised)} <span className='text-4xl'>ETH</span></p>
                                </div>
                                <div className="mt-5">
                                    <span className="text-5xl ml-10">💲</span>
                                </div>
                            </div>
                            <p>📉 <span className="text-gray-400">50% vs last month</span></p>
                        </div>

                        <div className='bg-gray-900/40 rounded-md shadow-2xl ring-2 ring-teal-900 mt-5 mb-8 p-5 w-[60%]'>
                            <div className='flex gap-10 mb-2'>
                                <div>
                                    <h2 className='text-2xl whitespace-nowrap font-bold text-gray-100 text-start mb-2'>Active Campaign</h2>
                                    <p className='text-5xl text-green-700 font-bold text-start'>{campaignInfoLoading ? "..." : activeCampaign}</p>
                                </div>
                                <div className="mt-5">
                                    <span className="text-5xl -ml-4">📈</span>
                                </div>
                            </div>
                            <p>📉 <span className='text-gray-500'>50% vs last month</span></p>
                        </div>

                        <div className='bg-gray-900/40 rounded-md shadow-2xl ring-2 ring-teal-900 mt-5 mb-8 p-5 w-[60%]'>
                            <div className='flex gap-10 mb-2'>
                                <div>
                                    <h2 className='text-2xl whitespace-nowrap font-bold text-gray-100 text-start mb-2'>Total Contributors</h2>
                                    <p className='text-5xl text-green-700 font-bold text-start'>{campaignInfoLoading ? "..." : calculateStats.totalContributors}</p>
                                </div>
                                <div className="mt-5">
                                    <span className="text-5xl ml-2">👤</span>
                                </div>
                            </div>
                            <p>📉 <span className='text-gray-500'>50% vs last month</span></p>
                        </div>

                        <div className='bg-gray-900/40 rounded-md shadow-2xl ring-2 ring-teal-900 mt-5 mb-8 w-[60%] p-5'>
                            <div className='flex gap-10 mb-2'>
                                <div>
                                    <h2 className='text-xl whitespace-nowrap font-bold text-gray-100 text-start mb-2'>Successful Campaign</h2>
                                    <p className='text-5xl text-green-700 font-bold text-start'>{campaignInfoLoading ? "..." : successfulCampaign}</p>
                                </div>
                                <div className="mt-7">
                                    <span className="text-5xl -ml-6">🏅</span>
                                </div>
                            </div>
                            <p>📉 <span className='text-gray-500'>50% vs last month</span></p>
                        </div>

                        <div className='bg-gray-900/40 rounded-md shadow-2xl ring-2 ring-teal-900 mt-5 mb-8 p-5 w-[60%]'>
                            <div className='flex gap-10 mb-2'>
                                <div>
                                    <h2 className='text-2xl whitespace-nowrap font-bold text-gray-100 text-start mb-2'>Failed Campaign</h2>
                                    <p className='text-5xl text-green-700 font-bold text-start'>{campaignInfoLoading ? "..." : calculateStats.failedCampaigns}</p>
                                </div>
                                <div className="mt-5">
                                    <span className="text-5xl ml-1">💹</span>
                                </div>
                            </div>
                            <p>📉 <span className='text-gray-500'>50% vs last month</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 container mx-auto'>
                <div className='bg-gray-900/40 rounded-md shadow-2xl ring-2 ring-teal-900 mt-5 mb-8 p-3'>
                    <div className='px-1 py-2'>
                        <h2 className='text-xl font-bold text-gray-100 text-center mb-2'>My Campaign</h2>
                        <p className='text-5xl text-green-700 font-bold text-center'>{userCampaign ? userCampaign.length : 0}</p>
                    </div>
                </div>

                <div className='bg-gray-900/40 rounded-md shadow-2xl ring-2 ring-teal-900 mt-5 mb-8 p-3'>
                    <div className='px-1 py-2'>
                        <h2 className='text-xl font-bold text-gray-100 text-center mb-2'>My Contributions</h2>
                        <p className='text-center'>
                            <span className='text-5xl text-green-700 font-bold text-center'>{formatEthValue(userContributions)}</span> 
                            <span className='text-gray-300 text-3xl font-bold'>ETH</span>
                        </p>
                    </div>
                </div>

                <div className='bg-gray-900/40 rounded-md shadow-2xl ring-2 ring-teal-900 mt-5 mb-8 p-3'>
                    <div className='px-1 py-2'>
                        <h2 className='text-xl font-bold text-gray-100 text-center mb-2'>My Active Campaign</h2>
                        <p className='text-5xl text-green-700 font-bold text-center'>{userActiveCampaignCount}</p>
                    </div>
                </div>

                <div className='bg-gray-900/40 rounded-md shadow-2xl ring-2 ring-teal-900 mt-5 mb-8 p-3'>
                    <div className='px-1 py-2'>
                        <h2 className='text-xl font-bold text-gray-100 text-center mb-2'>Success Rate</h2>
                        <p className='text-center'>
                            <span className='text-5xl text-green-700 font-bold text-center'>{userSuccessRate}%</span> 
                        </p> 
                    </div>
                </div>
            </div>
        
            {/* Donation section */}
            <div className='container mx-auto p-6'>
                <h2 className="text-4xl font-bold text-rose-700 text-center mb-6">Support a Campaign</h2>
                <div className='flex flex-col items-center justify-center w-full'>
                    <div>
                        <label className="text-lg font-medium text-gray-300">Select Campaign</label>
                        <select 
                            value={selectedCampaignId} 
                            onChange={(e) => {
                                setSelectedCampaignId(e.target.value); 
                                setSelectedRewardTierId('');
                            }} 
                            className="mt-1 mb-2 w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md"
                        >
                            <option value="" disabled>Choose a campaign...</option>
                            {NormalCampaigns.filter(c => c.status === 0n).map((campaign, index) => {
                                const originalIndex = campaignInfo.findIndex(c => c.id === campaign.id);
                                return (
                                    <option key={campaign.id || index} value={originalIndex}>
                                        {campaign.title}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="mr-7">
                        <label className="text-lg font-medium text-gray-300">Select Reward Tier</label>
                        <select 
                            value={selectedRewardTierId} 
                            onChange={(e) => setSelectedRewardTierId(e.target.value)} 
                            disabled={!selectedCampaignId} 
                            className="mt-1 w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md disabled:bg-gray-600"
                        >
                            <option value="" disabled>Choose a tier...</option>
                            {selectedCampaign?.rewardTier?.map((tier, index) => {
                                const minDonationFormatted = safeFormatEther(tier.minDonation);
                                return (
                                    <option key={index} value={index}>
                                        {tier.name || `Tier ${index + 1}`} - Min: {minDonationFormatted} ETH
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="mr-30 mt-2 mb-3">
                        <label className="text-lg font-medium text-gray-300">Donation Amount (ETH)</label>
                        <div className="flex flex-col gap-2 mt-1">
                            <input
                                type="number"
                                step="0.01"
                                value={donationAmount}
                                onChange={(e) => setDonationAmount(e.target.value)}
                                placeholder="Amount"
                                className="flex-1 p-2 w-full border border-gray-600 bg-gray-700 text-white rounded-md"
                            />
                            <button
                                onClick={handleDonate}
                                disabled={!isConnected || !selectedCampaignId || selectedRewardTierId === '' || !donationAmount}
                                className="bg-teal-600 text-white p-2 font-bold rounded-md hover:bg-teal-700 disabled:bg-gray-600"
                            >
                                Donate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Withdraw section */}
            {address && (
                <div className='container mx-auto mt-10 p-6 border border-green-600 rounded-lg bg-gray-800/50'>
                    <h2 className="text-2xl font-bold text-white text-center mb-6">My Successful Campaigns</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {userCampaign?.filter(c => c.status === 2n).map((campaign, index) => {
                            const originalIndex = campaignInfo.findIndex(c => c.id === campaign.id);
                            const targetAmount = safeFormatEther(campaign.target);
                            const collectedAmount = safeFormatEther(campaign.collectedAmount);
                            return (
                                <div key={campaign.id || index} className="p-4 border rounded-lg bg-green-900/30 text-white">
                                    <h3 className="text-lg font-bold">{campaign.title}</h3>
                                    <p className="text-sm text-gray-300">Goal Reached: {targetAmount} ETH</p>
                                    <p className="text-sm text-gray-300">Amount Raised: {collectedAmount} ETH</p>
                                    <p className="text-green-400 font-semibold mt-2">Status: Successful</p>
                                    
                                    {campaign.status === 2n && (
                                        <button
                                            onClick={() => handleWithdraw(originalIndex)}
                                            disabled={isConfirming}
                                            className="mt-4 w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 disabled:bg-gray-600"
                                        >
                                            {isConfirming ? 'Processing...' : 'Withdraw Funds'}
                                        </button>
                                    )}
                                    {campaign.status === 4n && (
                                        <p className="mt-4 text-green-300 font-semibold">Funds Withdrawn</p>
                                    )}
                                </div>
                            );
                        })}
                        {userCampaign?.filter(c => c.status === 2n).length === 0 && (
                            <p className="text-gray-400 text-center col-span-full">You have no successful campaigns yet.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Failed campaigns refund section */}
            {address && (
                <div className='container mx-auto mt-10 p-6 border border-red-600 rounded-lg bg-gray-800/50'>
                    <h2 className="text-2xl font-bold text-white text-center mb-6">Available Refunds</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {campaignInfo?.map((campaign, index) => {
                            const isDonor = campaign.donators?.some(donor => 
                                donor.toLowerCase() === address?.toLowerCase()
                            );
                            const isRefundable = campaign.status === 3n || campaign.status === 4n;

                            if (isDonor && isRefundable) {
                                return (
                                    <div key={campaign.id || index} className="p-4 border rounded-lg bg-red-900/30 text-white">
                                        <h3 className="text-lg font-bold">{campaign.title}</h3>
                                        <p className="text-sm text-gray-300">Your contribution is eligible for a refund.</p>
                                        <p className="text-red-400 font-semibold mt-2">Status: {campaign.status === 3n ? 'Failed' : 'Refundable'}</p>
                                        
                                        <button
                                            onClick={() => handleRefund(index)}
                                            disabled={isConfirming}
                                            className="mt-4 w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 disabled:bg-gray-600"
                                        >
                                            {isConfirming ? 'Processing...' : 'Get Refund'}
                                        </button>
                                    </div>
                                );
                            }
                            return null;
                        })}
                        {!campaignInfo?.some(campaign => {
                            const isDonor = campaign.donators?.some(donor => 
                                donor.toLowerCase() === address?.toLowerCase()
                            );
                            return isDonor && (campaign.status === 3n || campaign.status === 4n);
                        }) && (
                            <p className="text-gray-400 text-center col-span-full">You have no campaigns available for refund.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Emergency withdraw */}
            <EmergencyVotingView campaigns={votingCampaigns} />
            
            {/* View */}
            <div className='mt-5'>
                <View campaigns={NormalCampaigns} isLoading={campaignInfoLoading}/>
            </div>
            
            {/* My campaign */}
            <div className='mt-5'>
                <Createcampaign onCreate={CreateCampaign}/>
            </div>

            <div className='mt-4'>
                <WhyFund/>
            </div>
        </div>
    )
}

export default Campaign