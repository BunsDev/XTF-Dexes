import scaffoldConfig from "~~/scaffold.config";
import { contracts } from "~~/utils/scaffold-eth/contract";

export function getAllContracts() {
  const contractsData = contracts?.[scaffoldConfig.targetNetworks[0].id];
  return contractsData ? contractsData : {};
}

export const SEPOLIA_NETWOKR_ID = scaffoldConfig.targetNetworks[0].id;
export const XRP_NETWORK_ID = scaffoldConfig.targetNetworks[1].id;


export function getContractByNetworkId(network: number) {
  const contractsData = contracts?.[network];
  return contractsData ? contractsData : {};
}