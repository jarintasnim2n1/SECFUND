
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
contract CrowdFunding is ReentrancyGuard{
    //enum for fixed component
enum Category{
Art, Technology, Film, Education, Music, Community, Health, Game
}

enum CampaignStatus{
    active, voting, successfull, refunded, withdrawal
}
uint256 public votingPeriodDuration=3 days;
uint256 public quoremPercetage=50;
//  struct for crowdfunding

struct Donation{
    address donator;
    uint256 amount;
    uint256 rewardTierId;
    bool refunded;
}

 struct RewardTier{
    uint256 minDonation;
    string description;
    uint256 quantity;
    uint256 claimed;
 }
  struct Campaign{
    string title;
    string description;
    uint256 collectedAmount;
    address owner;
    uint256 target;
    uint256 deadline;
    uint256 votingDeadline;
    Category campaignCategory;
    CampaignStatus status;
    Donation[] donations;
    RewardTier[] rewardTier;
 }


 //mapping 

 mapping(uint256=>Campaign) public campaigns;
 mapping(uint256=>mapping(address=>bool)) public hasVoted;
 mapping(uint256=>uint256) public yesVote;
 mapping(uint256=>uint256) public noVote;
 mapping(Category=>uint256[]) public campaignCategoryId;

 //events

 event CampaignCreated(uint256 indexed campaignId,address indexed owner, string title, uint256 target, Category category);
 event DonationMade(uint256 indexed campaignId, address indexed donator, uint256 amount, uint256 rewardTier);
 event WithdrawalVoteTriggered(uint256 campaignId);
 event VoteCasted(uint256 indexed campaignId, address indexed voter, bool inFavor);
 event VoteFinalized(uint256 indexed campaignId, bool approved);
 event CampaignFinalized(uint256 indexed campaignId, bool successfull);
 event VotingStarted(uint256 indexed campaignId, string title, address indexed owner, uint256 votingDeadline);
 uint256 numberOfCampaign =0;
 //campaign create function 

 function CreateCampaign(string memory _title, string calldata _description, uint256 _target,  Category _category, uint256 _deadline, uint256[] memory  _rewardMinDonation, uint256[] memory _rewardQuantities, string[] memory _rewardDescriptions) public returns(uint256){
  require(_deadline > block.timestamp, "Campaign has expired");
  require(_target >0, "Invalid target");
  require(_rewardMinDonation.length == _rewardDescriptions.length && _rewardDescriptions.length == _rewardQuantities.length, "Reward tier mismatch");
   uint256 newCampaignId= numberOfCampaign;
   Campaign storage newCampaign= campaigns[newCampaignId];

   newCampaign.owner= msg.sender;
   newCampaign.title= _title;
   newCampaign.description=_description;
   newCampaign.target=_target;
   newCampaign.deadline=_deadline;
   newCampaign.collectedAmount= 0;
   newCampaign.campaignCategory=_category;
   newCampaign.status= CampaignStatus.active;

   for(uint256 i=0; i<_rewardMinDonation.length; i++){
     newCampaign.rewardTier.push(RewardTier({
       minDonation:_rewardMinDonation[i],
       description:_rewardDescriptions[i],
       quantity:_rewardQuantities[i],
       claimed:0
     }));
   }

   campaignCategoryId[_category].push(newCampaignId);
   emit CampaignCreated(newCampaignId,msg.sender,_title, _target,_category);
   numberOfCampaign++;
   return newCampaignId;
 }

  //donate function ekti campaign ekti specific rewardTier select kore eth send kore
  function donateToFunction(uint256 _campaignId, uint256 _rewardTierId) public payable nonReentrant{
     uint256 amounts= msg.value;
     require(amounts>0, "Invalid eth");
     Campaign storage newcampaign = campaigns[_campaignId];
     require(newcampaign.status== CampaignStatus.active, "InActive fund");
     require(_rewardTierId<newcampaign.rewardTier.length, "Invalid reward tier");
     RewardTier storage selectedTier= newcampaign.rewardTier[_rewardTierId];
     require(amounts>= selectedTier.minDonation, "Donation amount is low!");

     newcampaign.donations.push(Donation({
        donator:msg.sender,
        amount:amounts,
        rewardTierId:_rewardTierId,
        refunded:false
     }));
     require(selectedTier.claimed < selectedTier.quantity, "This reward tier is out of stock");
     selectedTier.claimed++;
     newcampaign.collectedAmount +=amounts;
     emit DonationMade(_campaignId,msg.sender,amounts, _rewardTierId);
  }
  //triggerWithdrawalVote function fundcreator emergency case e fund withdraw kore voting er maddome deadline er age
  function triggerWithdrawalVote(uint256 _campaignId) public {
    Campaign storage newcampaign= campaigns[_campaignId];
    require(newcampaign.owner == msg.sender,"Only owner can create vote!");
    require(block.timestamp<newcampaign.deadline,"can't trigger vote after deadline");
    require(newcampaign.status== CampaignStatus.active,"campaign not active state");
    require(newcampaign.collectedAmount>0,"No donation yet");
    newcampaign.status= CampaignStatus.voting;
    newcampaign.votingDeadline = block.timestamp + votingPeriodDuration;
    emit WithdrawalVoteTriggered(_campaignId);
    emit VotingStarted(_campaignId, newcampaign.title, newcampaign.owner, newcampaign.votingDeadline);
  }

  //vote function 
 function vote(uint256 _id, bool inFavor) public{
  Campaign storage campaign= campaigns[_id];
  require(campaign.status== CampaignStatus.voting, "Campaign is not in voting state");
  require(campaign.votingDeadline> block.timestamp, "Voting period has ended");

  bool isDonator=false; 
  for(uint256 i=0;i<campaign.donations.length;i++){
    if(campaign.donations[i].donator== msg.sender){
      isDonator=true;
      break;
    }
    }
  require(isDonator,"Only donator can vote");
  //donate function ekti campaign ekti specific rewardTier select kore eth send kore
  require(!hasVoted[_id][msg.sender],"Already voted");
  hasVoted[_id][msg.sender]= true;
  if(inFavor){
    yesVote[_id] ++;
  }
  else{
    noVote[_id] ++;
  }
  emit VoteCasted(_id, msg.sender, inFavor);
  }
  //finalize Vote function
 
 
function finalizeVote(uint256 _campaignId) public{ 
  Campaign storage newcampaign= campaigns[_campaignId];
  require(newcampaign.status== CampaignStatus.voting, "Campaign is not in voting state");
  require(newcampaign.votingDeadline< block.timestamp, "Voting period has not ended yet");
  uint256 totalVote= yesVote[_campaignId] + noVote[_campaignId] ; 
  uint256 totalDonation= newcampaign.donations.length;
  bool approved= false;
  bool quorem= (totalVote*100)/totalDonation>= quoremPercetage;
  if(quorem && yesVote[_campaignId]>noVote[_campaignId] ){
    approved= true;
    newcampaign.status= CampaignStatus.successfull;

  }
  else{
    newcampaign.status= CampaignStatus.active;
  }
  emit VoteFinalized(_campaignId, approved);
}
   
  //finalize Campaign function deadline sesh holee last position specify kora
function finalizeCampaign(uint256 _id) public {
 Campaign storage newcampaign= campaigns[_id];
 require(newcampaign.status== CampaignStatus.active,"campaign already start");
 require(block.timestamp>= newcampaign.deadline,"campaign not passed yet");
 
 if(newcampaign.collectedAmount>=newcampaign.target){
  newcampaign.status= CampaignStatus.active;
  emit CampaignFinalized(_id, true);
 }
 else{
   newcampaign.status= CampaignStatus.refunded;
  emit CampaignFinalized(_id, false);
 }

}

  //withdrawfund function
 function withdrawFunds(uint256 _campaignId) public nonReentrant{
  Campaign storage campaign= campaigns[_campaignId];
  require(campaign.owner== msg.sender,"only owner can withdraw");
  require(campaign.status== CampaignStatus.successfull,"campaign isn't successfull");
  uint256 withdrawAmount= campaign.collectedAmount;
  campaign.collectedAmount=0;
  campaign.status= CampaignStatus.withdrawal;
  (bool success,)= payable(campaign.owner).call{value: withdrawAmount}("");
  require(success,"Transfer failed");
}
  // getRefund function
function getRefund(uint256 _campaignId) public nonReentrant{
  Campaign storage campaign= campaigns[_campaignId];
  require(campaign.status== CampaignStatus.refunded,"Refund available only refunded campaign");
  for(uint256 i=0; i<campaign.donations.length;i++){
    if(campaign.donations[i].donator== msg.sender && campaign.donations[i].refunded){
      uint256 refundAmount= campaign.donations[i].amount;
      campaign.donations[i].refunded= true;
      (bool success,)=payable(msg.sender).call{value:refundAmount}("");
      require(success,"Refund failed");
      return;
    }
  }
  revert("No refund available ffor this campaign!");
}
  //getCampaign function
 function getCampaign() public view returns(Campaign[] memory){
   Campaign[] memory allcampaign= new Campaign[](numberOfCampaign);

   for(uint256 i=0; i<allcampaign.length;++i){
    Campaign storage item= campaigns[i];
    allcampaign[i]=item;
   }
   return allcampaign;
 }
  //getCampaign category function
 function getCampaignIdByCategory(Category _category) public view returns(uint256[] memory){
  return campaignCategoryId[_category];
 }

  //getDonations function
function getDonations(uint256 _campaignId) public view returns(Donation[] memory){
  return campaigns[_campaignId].donations;
 }
 //get rewardTier function
function getRewardTier(uint256 _campaignId) public view returns(RewardTier[] memory){
  return campaigns[_campaignId].rewardTier;
}

//get totak campaign
 function getTotalCampaigns() public view returns (uint256) {
        return numberOfCampaign;
    }
}


