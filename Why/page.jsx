"use client";
import React from 'react'

const WhyFund = () => {
  return (
    <div className="py-12 px-4 bg-rose-900/20 ">
      <h1 className='text-center text-3xl font-bold mb-8 text-white'>
        Why Choose <span className='text-yellow-600 text-3xl font-bold'>SEC</span> 
        <span className='text-rose-800 text-3xl font-bold'>FUND</span> ?
      </h1>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4'>
        {/* Feature 1 */}
        <div className="bg-white p-3 rounded-lg shadow-lg flex items-center flex-col">
          <div className="h-10 w-10 rounded-md mt-2 bg-teal-800 flex items-center justify-center mb-4">
            <span className="text-white font-bold ">🚀</span>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2 text-center">Launch Your Idea</h2>
            <p className="text-gray-600 font-medium text-center">
              Turn your innovative ideas into reality with community-backed funding.
            </p>
          </div>
        </div>
        
        {/* Feature 2 */}
        <div className="bg-white p-3 rounded-lg shadow-lg flex flex-col items-center">
          <div className="h-10 w-10 rounded-md bg-teal-800 flex items-center justify-center mt-2 mb-4">
            <span className="text-white font-bold ">🛡️</span>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2 text-center">Secure & Transparent</h2>
            <p className="text-gray-600 font-medium text-center">
              Blockchain-powered security ensures every transaction is safe and transparent.
            </p>
          </div>
        </div>
        
        {/* Feature 3 */}
        <div className="bg-white p-3 rounded-lg shadow-lg flex flex-col items-center">
          <div className="h-10 w-10 rounded-md mt-2 bg-teal-800 flex items-center justify-center mb-4">
            <span className="text-white font-bold">🌍</span>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2 text-center">Global Community</h2>
            <p className="text-gray-600 font-medium text-center">
              Connect with backers who believe in your vision and want to see you succeed.
            </p>
          </div>
        </div>
        
        {/* Feature 4 */}
        <div className="bg-white p-3 rounded-lg shadow-lg flex flex-col items-center">
          <div className="h-10 w-10 mt-2 rounded-md bg-teal-800 flex items-center justify-center mb-4">
            <span className="text-white font-bold">🔗</span>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2 text-center">Decentralized</h2>
            <p className="text-gray-600 font-medium text-center">
              No central authority. Your funds are secure and controlled by smart contracts.
            </p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 container mx-auto mt-10 w-[60%]'>
       <div className='bg-gray-600 rounded-lg flex flex-col items-center px-2 py-3 shadow-lg ring ring-gray-300/60'>
        <h3 className='text-3xl font-bold text-white mb-2'>1000<span className='text-red-700 font-extrabold text-4xl'>+</span> </h3>
        <p className='text-xl text-yellow-600 mb-1'>Campaign Launched</p>
       </div>
       <div className='bg-gray-600 rounded-lg flex flex-col items-center px-2 py-3 shadow-lg ring ring-gray-300/60'>
        <h3 className='text-3xl font-bold text-white mb-2'><span className='text-green-600 text-3xl'>$</span> 2M <span className='text-red-700 font-extrabold text-4xl'>+</span>  </h3>
        <p className='text-xl text-yellow-600 mb-1'>Funds Raised</p>
       </div>
       <div className='bg-gray-600 rounded-lg flex flex-col items-center px-2 py-3 shadow-lg ring ring-gray-300/60'>
        <h3 className='text-3xl font-bold text-white mb-2'>50K<span className='text-orange-600 text-4xl font-extrabold'>+</span> </h3>
        <p className='text-xl text-yellow-600 mb-1'>Contributors</p>
       </div>
      </div>
    </div>
  )
}

export default WhyFund