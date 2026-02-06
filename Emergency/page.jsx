"use client";
import { useCrowdContract } from '@/app/web3/constant/CrowdContract';
import React, { useState } from 'react'
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
const EmergencyVotingView = ({campaigns}) => {
     const { campaignInfo, vote,finalizeVote, isLoading,refetchAll} = useCrowdContract();
     const {address}= useAccount();
     const [donationAmount, setDonationAmount]=useState(false);   
    if (!campaigns || campaigns.length === 0) {
        return null;
    }


const votingCampaigns= campaignInfo?.filter(c=>c.status===1n)|| [];

if(!votingCampaigns || votingCampaigns.length===0)return null;


  return (
    <div className='container mx-auto mt-10'>
     <h2 className="text-3xl font-bold text-red-500 mb-6 text-center">
        🚨 Emergency Voting Active 🚨 
     </h2>
      <p className="text-center text-gray-300 mb-8">The following campaigns are currently under emergency withdrawal voting. Please cast your vote.</p>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'>
               {votingCampaigns.map((campaign, index)=>{
                const originalIndex= campaignInfo.findIndex(c=>c.id=== campaign.id);
                const isOwner= address && campaign.owner.toLowerCase()=== address.toLowerCase();
 const isDonor = address && campaign.donors?.some(donor=>donor.toLowerCase()=== address.toLowerCase());
 
    return(
        <div key={campaign.id || index} className="p-4 border-2 border-orange-500 rounded-lg bg-orange-50">
          <h3 className='text-xl font-bold'>{campaign.title}</h3>
            <p>{campaign.description}</p>
            <p>Goal: {formatEther(campaign.target)} ETH </p>
            <p>Raised: {formatEther(totalRaised)} ETH </p>
            <p>DeadLine: {new Date(Number(campaign.deadline)*100).toLocaleString()}</p>
            <div className="mt-4 p-3 bg-white rounded border">
                <p className="font-semibold text-gray-800">Current Votes:</p>
                <div className="flex justify-between">
                  <p className="text-green-600"> Yes : {campaign.yesVote}</p>
                <p className="text-red-600">No : {campaign.noVote}</p>
                </div>    
            </div>    
  {/* voting part */}
    {isDonor && (
        <div className="mt-4 flex gap-2" >
            <button onClick={() => vote(originalIndex, true)} 
                                        disabled={isLoading} 
                                        className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                                    >Yes Vote </button>
            <button  onClick={() => vote(originalIndex, false)} 
                                        disabled={isLoading} 
                                        className="flex-1 bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:bg-gray-400"
                                   >No Vote </button>

        </div>
    )}

     {isOwner && Date.now() > Number(campaign.votingDeadline) * 1000 && (
                                <button
                                    onClick={() => finalizeVote(originalIndex)}
                                    disabled={isLoading}
                                    className="mt-4 w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
                                >
                                    {isLoading ? 'Processing...' : 'Finalize Voting Result'}
                                </button>
                            )}

    {!isDonor && !isOwner && (
                                <p className="mt-4 text-gray-600 text-sm text-center">Only donors can vote in this emergency withdrawal.</p>
                            )}                        
          
        </div>
    )
 
               })} 
            </div>
    </div>
)}

export default EmergencyVotingView