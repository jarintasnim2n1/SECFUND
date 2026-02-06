"use client";
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Navbar = () => {
  return (
    <>
      <div className='bg-teal-900/50 w-full shadow-md h-5 p-10  '>
        <div className='flex items-center justify-between -mt-6'>
         <div className='flex items-center gap-2 '>
            {/* logo */} 

            <Image src={"/logo1.png"} alt="logo" width={40} height={40} className='h-15 w-15 p-1 -mt-2 bg-white rounded-full'/>
            <p className='font-extrabold text-yellow-600 text-4xl'>SEC<span className='text-rose-900'>FUND</span> </p>
         </div>
         <div className='text-2xl flex gap-5 text-yellow-500 font-bold '>
            {/* link */}
            <Link href={"/"} className=' hover:text-yellow-600' >Home</Link>
            <Link href={"/create"} className=' hover:text-yellow-600' >Campaign</Link>
            <Link href={"/view"} className=' hover:text-yellow-600' >View</Link>
            <Link href={"/Why"} className=' hover:text-yellow-600' >Why Fund</Link>
            <Link href={"/admin"} className=' hover:text-yellow-600' >Admin</Link>
            <Link href={"/footer"} className=' hover:text-yellow-600' >Footer</Link>
         </div>
         <div>
            {/* button */}
            <ConnectButton />
         </div>
        </div>
      </div>
     </>
  )
}

export default Navbar
