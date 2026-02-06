"use client";
// import { ABI, ContractAddress } from "./data";
import { useState, useEffect } from "react";
import { parseEther } from "viem";
import { useAccount,  useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ABI, ContractAddress } from "./data";

export function useCrowdContract (){
    const {address, isconnected}= useAccount();
     const { writeContract, isPending: writePending, error: writeError } = useWriteContract();
    const {isLoading:isConfirming, isSuccess:isConfirmed}= useWaitForTransactionReceipt();
    const [totalRaised, setTotalRaised]= useState(0n);
    const [activeCampaign, setActiveCampaign]= useState(0);
    const [successfulCampaign, setSuccessfulCampaign]= useState(0);
    const [userCampaign, setUserCampaign]= useState([]);
    const [userContributions, setUserContributions]= useState(0n);
   //read function
     const {data:campaignInfo, refetch:refetchCampaignInfo, isLoading:campaignInfoLoading,isError:campaignInfoError, error:campaignInfoErrorMsg}=useReadContract({
         address:ContractAddress,
         abi:ABI,
         functionName:"getCampaign",
          query: {
                enabled: !!address && !!ContractAddress ,
                refetchInterval: 5000,
            }
     });
   
    const CategoryCampaigns=(category)=>{
     const {data:campaignCategoryById, refetch:refetchCampaignCategory, isLoading:campaignCategoryLoading,isError:campaignCategoryError, error:campaignCategoryErrorMsg}=useReadContract({
         address:ContractAddress,
         abi:ABI,
         functionName:"getCampaignIdByCategory",
         args:[BigInt(category) || 0],
        query: {
                enabled: !!address && !!ContractAddress && category !== undefined,
                refetchInterval: 5000,
            }
     });
      return {
      campaignCategoryById,
      campaignCategoryLoading,
      campaignCategoryError,
      campaignCategoryErrorMsg,
      refetchCampaignCategory
    };
    }
    const CampaignDonation=(campaignId)=>{
     const {data:donations, refetch:refetchDonations, isLoading:donationsLoading,isError:donationsError, error:donationsErrorMsg}=useReadContract({
         address:ContractAddress,
         abi:ABI,
         functionName:"getCampaignIdByCategory",
         args:[BigInt(campaignId) || 0],
         query:{
             enabled:!!address && !!ContractAddress && campaignId !==undefined,
             refetchInterval:5000,
         }
     });

      return {
      donations,
      donationsLoading,
      donationsError,
      donationsErrorMsg,
      refetchDonations
    };
    }
  const { data: totalCampaigns, isLoading: totalCampaignsLoading } = useReadContract({
    address: ContractAddress,
    abi: ABI,
    functionName: "getTotalCampaigns",
    query: { refetchInterval: 5000 }
});

useEffect(()=>{
  if(campaignInfo && campaignInfo.length>0){
    let totalRaisedSum=0n;
    let activeCount=0;
    let successfulCount=0;
    const myCampaigns =[];
    let myContributionsSum=0n;
    const activeStatus=0n;
    const successfulStatus=2n;

    for(const campaign of campaignInfo){
      totalRaisedSum += campaign.collectedAmount;
      if(campaign.status=== activeStatus){
        activeCount++;
      }
      if(campaign.status=== successfulStatus)successfulCount++;

      if(address && campaign.owner.toLowerCase()=== address.toLowerCase() )
        myCampaigns.push(campaign);

      if(address){
        for(const donation of campaign.donations){
          if(donation.donator.toLoerCase()=== address.toLowerCase())
            myContributionsSum+= donation.amount;
        }
      }
    }
    setTotalRaised(totalRaisedSum);
    setActiveCampaign(activeCount);
    setSuccessfulCampaign(successfulCount);
    setUserCampaign(myCampaigns);
    setUserContributions(myContributionsSum);
  }
  else{
     setTotalRaised(0n);
    setActiveCampaign(0);
    setSuccessfulCampaign(0);
    setUserCampaign([]);
    setUserContributions(0n);
  }
},[address, campaignInfo]);
 //write function   
 const CreateCampaign=({
        title = "",
        description = "",
        target = "0",
        deadline = null,
        category = 7,
        rewardMinDonations = [],
        rewardQuantities = [],
        rewardDescriptions = [],
        onSuccess = null,
        onError = null
    })=>{
    if(!address ){
        alert("Please connect your wallet first");
        return;
    }
    if(!title.trim()){
        alert("Campaign title");
        return;
    }
     if (!description.trim()) {
      alert("Campaign description is required");
      return;
    }

    if (Number(target) <= 0) {
      alert("Target amount must be greater than 0");
      return;
    }
     if (rewardMinDonations.length !== rewardQuantities.length ||
        rewardQuantities.length !== rewardDescriptions.length) {
      alert("Reward arrays must have same length");
      return;
    }
     const minDonationsInWei = rewardMinDonations.map(amount => 
      parseEther(amount.toString())
    );
     

    try{
    writeContract({
        address:ContractAddress,
        abi:ABI,
        functionName:"CreateCampaign",
        args:[title, description,parseEther(target),BigInt(deadline) , BigInt(category), minDonationsInWei,
                    rewardQuantities.map(q => BigInt(q)),
                    rewardDescriptions]
       
    },
     {
                onSuccess: (hash) => {
                    console.log("✅ Campaign created! Transaction hash:", hash);
                    if (onSuccess) onSuccess(hash);
                },
                onError: (error) => {
                    console.error("❌ Error creating campaign:", error);
                    if (onError) onError(error);
                }
    })
    }catch(error){
        console.error(error);
    }
 }
const donateToFunction=({campaignId,rewardTierId, amountETH,
    onSuccess = null,
    onError = null})=>{
         if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!campaignId && campaignId !== 0) {
      alert("Campaign ID is required");
      return;
    }

    if (!rewardTierId && rewardTierId !== 0) {
      alert("Reward tier ID is required");
      return;
    }

    if (parseFloat(amountETH) <= 0) {
      alert("Donation amount must be greater than 0");
      return;
    }
    try{
     writeContract({
        address:ContractAddonateToFunctiondress,
        abi:ABI,
        functionName:"",
        args:[BigInt(campaignId),BigInt( rewardTierId)],
        value: parseEther(amountETH),
     },
     {
        onSuccess: (hash) => {
          console.log("✅ Donation successful! Transaction hash:", hash);
          console.log("Donation details:", {
            campaignId,
            rewardTierId,
            amount: amountETH + " ETH",
            donor: address
          });
          if (onSuccess) onSuccess(hash);
        },
        onError: (error) => {
          console.error("❌ Error donating:", error);
          
          // Common error messages
          const errorMsg = error.shortMessage || error.message;
          if (errorMsg.includes("Invalid eth")) {
            alert("Please enter a valid ETH amount");
          } else if (errorMsg.includes("InActive fund")) {
            alert("This campaign is no longer active");
          } else if (errorMsg.includes("Invalid reward tier")) {
            alert("Invalid reward tier selected");
          } else if (errorMsg.includes("Donation amount is low")) {
            alert("Donation amount is below minimum for this reward tier");
          } else if (errorMsg.includes("out of stock")) {
            alert("This reward tier is sold out");
          } else {
            alert(`Donation failed: ${errorMsg}`);
          }
          
          if (onError) onError(error);
        }
    })
    }catch(error){
        console.error(error);
    }
}

const triggerWithdrawalVote =({campaignId, onSuccess, onError})=>{
    try{
     writeContract({
        address:ContractAddress,
        abi:ABI,
        functionName:"triggerWithdrawalVote",
        args:[BigInt(campaignId)],
        
     },
     {
                onSuccess: (hash) => {
                    console.log("✅ Campaign created! Transaction hash:", hash);
                    if (onSuccess) onSuccess(hash);
                },
                onError: (error) => {
                    console.error("❌ Error creating campaign:", error);
                    if (onError) onError(error);
                }
    })
    }catch(error){
        console.error(error);
    }
}

const vote=({ campaignId, inFavor, onSuccess, onError })=>{
  try{
    writeContract({
    address:ContractAddress, // Replace with your contract address
    abi:ABI,
    functionName: 'vote',
    args: [BigInt(campaignId), inFavor],
    enabled: campaignId !== undefined && campaignId !== null,
  },
 {
                onSuccess: (hash) => {
                    console.log("✅ Campaign created! Transaction hash:", hash);
                    if (onSuccess) onSuccess(hash);
                },
                onError: (error) => {
                    console.error("❌ Error creating campaign:", error);
                    if (onError) onError(error);
                }})
  }catch(error){
    console.error(error);
  }
}

const finalizeVote=({ campaignId, onSuccess, onError })=>{
 try{
    writeContract({
    address:ContractAddress, // Replace with your contract address
    abi:ABI,
    functionName: 'finalizeVote',
    args: [BigInt(campaignId)],
    enabled: campaignId !== undefined && campaignId !== null,
  },
 {
                onSuccess: (hash) => {
                    console.log("✅ Campaign created! Transaction hash:", hash);
                    if (onSuccess) onSuccess(hash);
                },
                onError: (error) => {
                    console.error("❌ Error creating campaign:", error);
                    if (onError) onError(error);
                }})
  }catch(error){
    console.error(error);
  }
}

const finalizeCampaign=({ campaignId, onSuccess, onError })=>{
   try{
    writeContract({
    address:ContractAddress, // Replace with your contract address
    abi:ABI,
    functionName: 'finalizeCampaign',
    args: [BigInt(campaignId)],
    enabled: campaignId !== undefined && campaignId !== null,
  },
 {
                onSuccess: (hash) => {
                    console.log("✅ Campaign created! Transaction hash:", hash);
                    if (onSuccess) onSuccess(hash);
                },
                onError: (error) => {
                    console.error("❌ Error creating campaign:", error);
                    if (onError) onError(error);
                }})
  }catch(error){
    console.error(error);
  } 
}

const withdrawFunds=({ campaignId, onSuccess, onError })=>{
 try{
    writeContract({
    address:ContractAddress, // Replace with your contract address
    abi:ABI,
    functionName: 'withdrawFunds',
    args: [BigInt(campaignId)],
    enabled: campaignId !== undefined && campaignId !== null,
  },
 {
                onSuccess: (hash) => {
                    console.log("✅ Campaign created! Transaction hash:", hash);
                    if (onSuccess) onSuccess(hash);
                },
                onError: (error) => {
                    console.error("❌ Error creating campaign:", error);
                    if (onError) onError(error);
                }})
  }catch(error){
    console.error(error);
  } 
}

const getRefund=({campaignId})=>{
   try{
    writeContract({
    address:ContractAddress, // Replace with your contract address
    abi:ABI,
    functionName: 'getRefund',
    args: [BigInt(campaignId)],
    enabled: campaignId !== undefined && campaignId !== null,
  },
 {
                onSuccess: (hash) => {
                    console.log("✅ Campaign created! Transaction hash:", hash);
                    if (onSuccess) onSuccess(hash);
                },
                onError: (error) => {
                    console.error("❌ Error creating campaign:", error);
                    if (onError) onError(error);
                }})
  }catch(error){
    console.error(error);
  }  
}

const refetchAll= async()=>{
  await Promise.al([
    refetchCampaignInfo(),
    refetchCampaignCategory(),
    refetchDonations()
  ])
}


    return(
        { 
         //write function
         CreateCampaign,
        donateToFunction,
        triggerWithdrawalVote,
        vote,
         finalizeVote,
         finalizeCampaign,
         withdrawFunds,
          getRefund,
          // read function 
              campaignInfo,
            campaignInfoLoading,
            campaignInfoError,
            //state
            address,
            isconnected,
           isLoading:writePending,
           isConfirming, 
           isConfirmed, 
             error:writeError,
             refetchAll,
          //  aggregated data
          totalCampaigns,
          totalRaised,
          activeCampaign,
          successfulCampaign,
          userCampaign,
          userContributions,
        }
    );
}