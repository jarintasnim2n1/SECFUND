import { ConnectButton } from '@rainbow-me/rainbowkit'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Navbar = () => {
  return (
    <>
      <div className='bg-teal-900/50 w-full shadow-md h-5 p-10 mx-auto '>
        <div className='flex items-center justify-between -mt-6'>
         <div className='flex items-center gap-2'>
            {/* logo */} 
            <Image src={"/logo1.png"} width={40} height={40}/>
            <p className='font-extrabold text-yellow-600 text-3xl'>SEC<span className='text-rose-900'>FUND</span> </p>
         </div>
         <div className='text-xl flex gap-5 text-yellow-500 font-bold '>
            {/* link */}
            <Link href={"/"} className=' hover:text-yellow-600' >Home</Link>
            <Link href={"/"} className=' hover:text-yellow-600' >Campaign</Link>
            <Link href={"/"} className=' hover:text-yellow-600' >View</Link>
            <Link href={"/"} className=' hover:text-yellow-600' >Footer</Link>
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
