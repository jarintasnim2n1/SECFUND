"use client";
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <div className='bg-emerald-950/70 p-10'>
      <div  className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-5 md:ml-20'> 
      <div>
       
         <div className='flex items-center gap-2 mb-5'>
                    {/* logo */} 
        
                    <Image src={"/logo1.png"} alt="logo" width={40} height={40} className='h-15 w-15 p-1 -mt-2 bg-white rounded-full'/>
                    <p className='font-extrabold text-yellow-600 text-4xl'>SEC<span className='text-rose-900'>FUND</span> </p>
                 </div>
        <p className='w-[60%] text-teal-100 hover:text-gray-500 leading-7 font-semibold'> SECFUND eliminates middlemen, reduces fees, and ensures that 100% of funds go directly to campaign creators through decentralized autonomous mechanisms.</p>
       <div className='flex gap-3 mt-4 ml-5'> 
         <Image src={"/facebook.png"} width={30} height={30} alt='facebook'/>
         <Image src={"/instagram.png"} width={30} height={30} alt='facebook'/>
         <Image src={"/LinkedIn.png"} width={30} height={30} alt='facebook'/>
       </div>
      
      </div>
      <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-300">Quick Links</h3>
            <ul className="space-y-2">
              <li className="text-teal-100 hover:text-gray-300">Start Campaign</li>
              <li className="text-teal-100 hover:text-gray-300">How It Works</li>
              <li className="text-teal-100 hover:text-gray-300">Explore Campaigns</li>
              <li className="text-teal-100 hover:text-gray-300">FAQ</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-300">Resources</h3>
            <ul className="space-y-2">
              <li className="text-teal-100 hover:text-gray-300">Documentation</li>
              <li className="text-teal-100 hover:text-gray-300">Blog</li>
              <li className="text-teal-100 hover:text-gray-300">Community</li>
              <li className="text-teal-100 hover:text-gray-300">Contact Us</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-300">Company</h3>
            <ul className="space-y-2">
              <li className="text-teal-100 hover:text-gray-300">About Us</li>
              <li className="text-teal-100 hover:text-gray-300">Careers</li>
              <li className="text-teal-100 hover:text-gray-300">Contact Us</li>
              <li className="text-teal-100 hover:text-gray-300">Support</li>
            </ul>
          </div>
       </div> 

       <div className="border-t border-teal-700 mt-8 pt-8">
         <p className="text-teal-200 text-center">
                © {new Date().getFullYear()} SECFUND. All rights reserved.
              </p>
        </div>  
    </div>
  )
}

export default Footer