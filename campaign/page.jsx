
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
        <Navbar/>
      <div className='container mx-auto px-4 py-8 flex gap-5'>
        {/* Hero section */}
        <div className='bg-gradient-to-r from-gray-400 to-gray-600 rounded-md shadow-md ring-4 ring-gray-600 mt-5 mb-8 p-5'>
          <div className=' px-8 py-10 ' >
            <h1 className=' text-xl font-bold text-gray-100 text-center'>Total Campaign</h1>
            <p className='text-3xl text-green-700 font-bold text-center' > 0</p>
          </div>

        </div>
        <div className='bg-gradient-to-r from-gray-400 to-gray-600 rounded-md shadow-md ring-4 ring-gray-600 mt-5 mb-8 p-5'>
          <div className=' px-8 py-10 ' >
            <h1 className=' text-xl font-bold text-gray-100 text-center'>Donation</h1>
            <p className='text-3xl text-green-700 font-bold' > 0 <span className='text-gray-300 text-2xl'>ETH</span> </p>
          </div>
        
        </div>
        <div className='bg-gradient-to-r from-gray-400 to-gray-600 rounded-md shadow-md ring-4 ring-gray-600 mt-5 mb-8 p-5'>
          <div className=' px-8 py-10 ' >
            <h1 className=' text-xl font-bold text-gray-100 text-center'>Withdraw</h1>
            <p className='text-3xl text-green-700 font-bold' > 0 <span className='text-gray-300 text-2xl'>ETH</span> </p>
          </div>

        </div>
        <div className='bg-gradient-to-r from-gray-400 to-gray-600 rounded-md shadow-md ring-4 ring-gray-600 mt-5 mb-8 p-5'>
          <div className=' px-8 py-10 ' >
            <h1 className=' text-xl font-bold text-gray-100 text-center'>Refund</h1>
            <p className='text-3xl text-green-700 font-bold' > 0 <span className='text-gray-300 text-2xl'>ETH</span> </p>
          </div>

        </div>
      </div>
      
    </div>

    </>
  )
}

export default Campaign