export default function isBenchFoul(matchEvent){
   return matchEvent.attribute3Key === 'isBenchFoul' && !!matchEvent.attribute3Value;
}