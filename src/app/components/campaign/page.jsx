
"use client";
import React, { useEffect, useState } from 'react'
import { useCrowdContract } from '../web3/CrowdContract'
import { useConnection } from 'wagmi';
import Navbar from '../nav/page';

const Campaign = () => {
    const { campaignInfo,campaignInfoLoading,campaignInfoError,CreateCampaign, donateToFunction, triggerWithdrawalVote, vote,finalizeVote,finalizeCampaign,withdrawFunds, getRefund, isLoading, error,isConfirming,isConfirmed,refetchAll} = useCrowdContract();
  const {address, isconnected}=useConnection();    
  const [mounted, setMounted]=useState(false);
  const [withdrawalAmount , setWithdrawalAmount]=useState(0);
  const [refundAmount, setRefundAmount]=useState(0);
   useEffect(()=>{
    setMounted(true);
  },[]);
    useEffect(()=>{
    if(isConfirmed){

    const timer= setTimeout(()=>{
      refetchAll();
      setWithdrawalAmount("");
      setRefundAmount("");
    }, 2000);

    return ()=>{clearTimeout(timer);}
   }
  },[isConfirmed, refetchAll]);

  return (
    <>
    <div className='min-h-screen bg-teal-950'>
      {/* header */}
      <div>
        <Navbar/>
      </div>
      { campaignInfo && <div> campaign Information </div>}
    </div>

    </>
  )
}

export default Campaign