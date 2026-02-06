"use client";
import React from 'react'
import { formatEther } from 'viem'

const View = ({ campaigns, isLoading }) => {
  // লোডিং স্টেট হ্যান্ডল করা
  if (isLoading) {
    return (
      <div className='bg-teal-600/10 p-8'>
        <h1 className='text-white text-4xl text-center p-4 font-bold'>All Campaigns</h1>
        <div className='flex justify-center items-center h-64'>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    )
  }

  // যদি কোন ক্যাম্পেইন না থাকে
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className='bg-teal-600/10 p-8'>
        <h1 className='text-white text-4xl text-center p-4 font-bold'>All Campaigns</h1>
        <div className='flex flex-col items-center justify-center h-64'>
          <p className='text-white text-xl mb-4'>No campaigns available yet.</p>
          <p className='text-gray-300 text-center'>Be the first to create a campaign and start fundraising!</p>
        </div>
      </div>
    )
  }

  // ক্যাম্পেইনের স্ট্যাটাস অনুযায়ী ব্যাজ রিটার্ন করার ফাংশন
  const getStatusBadge = (status) => {
    switch (status) {
      case 0n:
        return <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Active</span>
      case 1n:
        return <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">Voting</span>
      case 2n:
        return <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Successful</span>
      case 3n:
        return <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Failed</span>
      case 4n:
        return <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">Refundable</span>
      default:
        return <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">Unknown</span>
    }
  }

  // ক্যাম্পেইনের অগ্রগতি বার ক্যালকুলেট করার ফাংশন
  const calculateProgress = (raised, target) => {
    if (!target || target === 0n) return 0;
    return Math.min((Number(raised) / Number(target)) * 100, 100);
  }

  return (
    <div className='bg-teal-600/10 p-4 md:p-8'>
      <h1 className='text-white text-4xl text-center p-4 font-bold'>All Campaigns</h1>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4'>
        {campaigns.map((campaign, index) => {
          // ক্যাম্পেইন ডেটা এক্সট্রাক্ট করা
          const {
            id,
            title,
            description,
            target,
            collectedAmount,
            donators,
            deadline,
            status,
            owner
          } = campaign;

          // অগ্রগতি ক্যালকুলেট করা
          const progressPercentage = calculateProgress(collectedAmount, target);
          
          // ডেডলাইন ক্যালকুলেট করা
          const deadlineDate = new Date(Number(deadline) * 1000);
          const isExpired = deadlineDate < new Date();
          
          return (
            <div key={id || index} className='bg-white rounded-lg shadow-xl overflow-hidden transition-transform duration-300 hover:scale-105'>
              {/* ক্যাম্পেইন হেডার */}
              <div className='bg-gradient-to-r from-teal-600 to-teal-800 p-4 relative'>
                <div className='flex justify-between items-start'>
                  <h2 className='text-xl font-bold text-white truncate pr-2'>{title}</h2>
                  {getStatusBadge(status)}
                </div>
              </div>
              
              {/* ক্যাম্পেইন বডি */}
              <div className='p-4'>
                <p className='text-gray-700 mb-4 line-clamp-3'>
                  {description}
                </p>
                
                {/* অগ্রগতি বার */}
                <div className='mb-4'>
                  <div className='flex justify-between text-sm text-gray-600 mb-1'>
                    <span>Progress</span>
                    <span>{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div 
                      className='bg-teal-600 h-2 rounded-full transition-all duration-500' 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* ফান্ডিং তথ্য */}
                <div className='flex justify-between mb-3'>
                  <div className='text-center'>
                    <p className='text-sm text-gray-500'>Raised</p>
                    <p className='text-lg font-bold text-teal-600'>{formatEther(collectedAmount || 0)} ETH</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-sm text-gray-500'>Target</p>
                    <p className='text-lg font-bold text-gray-700'>{formatEther(target || 0)} ETH</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-sm text-gray-500'>Contributors</p>
                    <p className='text-lg font-bold text-gray-700'>{donators?.length || 0}</p>
                  </div>
                </div>
                
                {/* ডেডলাইন তথ্য */}
                <div className='mb-4 text-sm text-gray-600'>
                  <p>Deadline: {deadlineDate.toLocaleDateString()}</p>
                  {isExpired && status === 0n && (
                    <p className='text-red-500 font-semibold'>Campaign has ended</p>
                  )}
                </div>
                
                {/* ভিউ ডিটেইলস বাটন */}
                <button 
                  className='w-full bg-gradient-to-r from-teal-600 to-teal-800 text-white font-bold py-2 px-4 rounded-md hover:from-teal-700 hover:to-teal-900 transition-colors duration-300'
                  onClick={() => {
                    // ক্যাম্পেইন ডিটেইলস পেজে নেভিগেট করার লজিক
                    // উদাহরণস্বরূপ: router.push(`/campaign/${id}`)
                    console.log(`Viewing details for campaign ${id}`);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default View