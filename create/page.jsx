"use client"
import React, { useState } from 'react';
import { parseEther } from 'viem';

const Createcampaign = ({ onCreate, isLoading, isConfirming, error }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',   
        target: '',
        deadline: '',
        category: '0'
    });

    const [rewardTiers, setRewardTiers] = useState([
        { minDonation: '', quantity: '', description: '' }
    ]);

    // একটি হেলপার ফাংশন যা 100% নিশ্চিত করে যে আউটপুট একটি স্ট্রিং হবে
    const toSafeString = (value) => {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleRewardTierChange = (index, field, value) => {
        const updatedTiers = [...rewardTiers];
        updatedTiers[index][field] = value;
        setRewardTiers(updatedTiers);
    };

    const addRewardTier = () => {
        setRewardTiers([...rewardTiers, { minDonation: '', quantity: '', description: '' }]);
    };

    const removeRewardTier = (index) => {
        if (rewardTiers.length > 1) {
            const updatedTiers = rewardTiers.filter((_, i) => i !== index);
            setRewardTiers(updatedTiers);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // === ধাপ ১: সমস্ত ডেটা নিরাপদে স্ট্রিং-এ কনভার্ট করা ===
        const safeTitle = toSafeString(formData.title).trim();
        const safeDescription = toSafeString(formData.description).trim();
        const safeTarget = toSafeString(formData.target).trim();
        const safeDeadline = toSafeString(formData.deadline).trim();
        const safeCategory = toSafeString(formData.category).trim();

        // === ধাপ ২: মৌলিক ভ্যালিডেশন ===
        if (!safeTitle || !safeDescription || !safeTarget || !safeDeadline) {
            alert('Please fill in all required fields.');
            return;
        }

        // === ধাপ ৩: ডেটা টাইপ যাচাই এবং কনভার্সন ===
        const targetNumber = Number(safeTarget);
        if (isNaN(targetNumber) || targetNumber <= 0) {
            alert('Target must be a valid number greater than 0.');
            return;
        }

        const deadlineTimestamp = Math.floor(new Date(safeDeadline).getTime() / 1000);
        if (isNaN(deadlineTimestamp) || deadlineTimestamp <= Date.now() / 1000) {
            alert('Deadline must be a valid date in the future.');
            return;
        }

        const categoryNumber = Number(safeCategory);
        if (isNaN(categoryNumber) || categoryNumber < 0) {
            alert('Please select a valid category.');
            return;
        }

        // === ধাপ ৪: রিওয়ার্ড টিয়ার প্রসেসিং (সবচেয়ে ঝুঁকিপূর্ণ অংশ) ===
        let finalRewardTiers = [];
        try {
            finalRewardTiers = rewardTiers.map(tier => {
                const minDonationStr = toSafeString(tier.minDonation).trim();
                const quantityStr = toSafeString(tier.quantity).trim();
                const descriptionStr = toSafeString(tier.description).trim();

                if (!minDonationStr || !quantityStr || !descriptionStr) {
                    throw new Error('All reward tier fields must be filled.');
                }

                const minDonationNumber = Number(minDonationStr);
                const quantityNumber = Number(quantityStr);

                if (isNaN(minDonationNumber) || minDonationNumber <= 0) {
                    throw new Error('Minimum donation must be a valid number greater than 0.');
                }
                if (isNaN(quantityNumber) || quantityNumber <= 0) {
                    throw new Error('Quantity must be a valid number greater than 0.');
                }

                return {
                    minDonation: parseEther(minDonationNumber.toString()), // এখানে আমরা সংখ্যাকে স্ট্রিং-এ কনভার্ট করছি
                    quantity: BigInt(quantityNumber.toString()), // এবং এখানেও
                    description: descriptionStr
                };
            });
        } catch (e) {
            alert(`Error in reward tiers: ${e.message}`);
            return;
        }

        // === ধাপ ৫: স্মার্ট কন্ট্রাক্টে পাঠানোর জন্য চূড়ান্ত ডেটা অবজেক্ট তৈরি ===
        const payloadForContract = {
            title: safeTitle,
            description: safeDescription,
            target: parseEther(targetNumber.toString()), // টার্গেটকেও একইভাবে পাস করা হচ্ছে
            deadline: BigInt(deadlineTimestamp),
            category: BigInt(categoryNumber),
            rewardTiers: finalRewardTiers,
            onSuccess: () => {
                setFormData({ title: '', description: '', target: '', deadline: '', category: '0' });
                setRewardTiers([{ minDonation: '', quantity: '', description: '' }]);
                alert('Campaign created successfully!');
            }
        };
        
        console.log("Final Payload being sent to contract:", JSON.stringify(payloadForContract, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        , 2));

        // === ধাপ ৬: স্মার্ট কন্ট্রাক্ট ফাংশন কল ===
        try {
            onCreate(payloadForContract);
        } catch (error) {
            console.error("Transaction failed:", error);
            alert(`Transaction failed: ${error.message}`);
        }
    };

    return (
        <div className='bg-teal-600/20 p-4 md:p-8 rounded-lg'>
            <h1 className='text-3xl mt-2 font-bold text-yellow-500 text-center mb-6'>Create New Campaign</h1>
            
            {error && <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">Error: {error.message}</div>}

            <form onSubmit={handleSubmit} className='max-w-2xl mx-auto space-y-4'>
                {/* Campaign Title */}
                <div>
                    <label className='block text-teal-100 font-bold text-lg mb-2'>Campaign Title *</label>
                    <input
                        type='text'
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder='Enter campaign title'
                        className='w-full bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-md p-3 placeholder:text-gray-400 text-white'
                        required
                    />
                </div>

                {/* Campaign Description */}
                <div>
                    <label className='block text-teal-100 font-bold text-lg mb-2'>Campaign Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder='Enter campaign description'
                        rows="4"
                        className='w-full bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-md p-3 placeholder:text-gray-400 text-white resize-none'
                        required
                    />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* Target */}
                    <div>
                        <label className='block text-teal-100 font-bold text-lg mb-2'>Target (ETH) *</label>
                        <input
                            type='number'
                            name="target"
                            value={formData.target}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0.01"
                            placeholder='e.g., 5.0'
                            className='w-full bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-md p-3 placeholder:text-gray-400 text-white'
                            required
                        />
                    </div>

                    {/* Deadline */}
                    <div>
                        <label className='block text-teal-100 font-bold text-lg mb-2'>Deadline *</label>
                        <input
                            type='datetime-local'
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleInputChange}
                            className='w-full bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-md p-3 text-white'
                            required
                        />
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className='block text-teal-100 font-bold text-lg mb-2'>Category *</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className='w-full bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-md p-3 text-white'
                        required
                    >
                        <option value="0">Art</option>
                        <option value="1">Film</option>
                        <option value="2">Music</option>
                        <option value="3">Education</option>
                        <option value="4">Technology</option>
                        <option value="5">Health</option>
                        <option value="6">Game</option>
                        <option value="7">Other</option>
                    </select>
                </div>

                {/* Reward Tiers Section */}
                <div className="border-t border-teal-500 pt-6">
                    <h2 className="text-2xl font-bold text-teal-100 mb-4">Reward Tiers</h2>
                    {rewardTiers.map((tier, index) => (
                        <div key={index} className="bg-gray-800/50 p-4 rounded-lg mb-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-white">Tier {index + 1}</h3>
                                {rewardTiers.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeRewardTier(index)}
                                        className="text-red-400 hover:text-red-600 font-bold"
                                    >
                                        Remove Tier
                                    </button>
                                )}
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                                <input
                                    type='number'
                                    step="0.01"
                                    min="0.01"
                                    placeholder='Min. Donation (ETH)'
                                    value={tier.minDonation}
                                    onChange={(e) => handleRewardTierChange(index, 'minDonation', e.target.value)}
                                    className='bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-md p-2 placeholder:text-gray-400 text-white'
                                    required
                                />
                                <input
                                    type='number'
                                    min="1"
                                    placeholder='Quantity'
                                    value={tier.quantity}
                                    onChange={(e) => handleRewardTierChange(index, 'quantity', e.target.value)}
                                    className='bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-md p-2 placeholder:text-gray-400 text-white'
                                    required
                                />
                                <input
                                    type='text'
                                    placeholder='Reward Description'
                                    value={tier.description}
                                    onChange={(e) => handleRewardTierChange(index, 'description', e.target.value)}
                                    className='bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-md p-2 placeholder:text-gray-400 text-white'
                                    required
                                />
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addRewardTier}
                        className="bg-teal-700 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        + Add Another Reward Tier
                    </button>
                </div>

                {/* Submit Button */}
                <button
                    type='submit'
                    disabled={isLoading || isConfirming}
                    className='w-full bg-gradient-to-r from-teal-700 to-teal-900 hover:from-teal-800 hover:to-teal-950 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-md p-3 px-6 transition-all duration-300'
                >
                    {isConfirming ? 'Creating Campaign...' : 'Create Campaign'}
                </button>
            </form>
        </div>
    )
}

export default Createcampaign;