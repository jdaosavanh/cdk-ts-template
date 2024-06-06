import * as dotenv from 'dotenv';
import * as process from 'process';
import {BaseConfig,BaseParams} from "./base"

export type VpcParams = BaseParams & {
    vpcName?: string;
    vpcCIDR?: string;
    vpcMaxAzs?: number;
    vpcNatGateways?: number;
    vpcPublicSubnetMask?: number;
    vpcPrivateSubnetMask?: number;
    vpcIsolatedSubnetMask?: number;
    vpcPublicSubnetGN?: string;
    vpcAppSubnetGN?: string;
    vpcDBSubnetGN?: string;
}

export class VpcConfig extends BaseConfig {
    vpcName: string;
    vpcCIDR: string = '10.0.0.0/21'
    vpcMaxAzs: number = 3;
    vpcNatGateways: number = 1;
    vpcPublicSubnetMask: number = 24;
    vpcPrivateSubnetMask: number = 24;
    vpcIsolatedSubnetMask: number = 25
    vpcPublicSubnetGN: string = 'public-group';
    vpcAppSubnetGN: string ='app-group';
    vpcDBSubnetGN: string = 'db-group';

    constructor(config: VpcParams) {
        super(config);
        dotenv.config()
        this.vpcName = this.getString(process.env["VPC_NAME"], config.vpcName, this.vpcName);
        this.vpcCIDR = this.getString(process.env["VPC_CIDR"], config.vpcCIDR, this.vpcCIDR);
        this.vpcMaxAzs = this.getNum(process.env["VPC_MAX_AZ"], config.vpcMaxAzs, this.vpcMaxAzs);
        this.vpcNatGateways = this.getNum(process.env["VPC_NAME"], config.vpcNatGateways, this.vpcNatGateways);
        this.vpcPublicSubnetMask = this.getNum(process.env["VPC_PUBLIC_SUBNET_MASK"], config.vpcPublicSubnetMask, this.vpcPublicSubnetMask);
        this.vpcPrivateSubnetMask = this.getNum(process.env["VPC_PRIVATE_SUBNET_MASK"], config.vpcPrivateSubnetMask, this.vpcPrivateSubnetMask);
        this.vpcIsolatedSubnetMask = this.getNum(process.env["VPC_ISO_SUBNET_MASK"], config.vpcIsolatedSubnetMask, this.vpcIsolatedSubnetMask);
        this.vpcPublicSubnetGN = this.getString(process.env["VPC_PUBLIC_SUBNET_GN"], config.vpcPublicSubnetGN, this.vpcPublicSubnetGN);
        this.vpcAppSubnetGN = this.getString(process.env["VPC_APP_SUBNET_GN"], config.vpcName, this.vpcName);
        this.vpcDBSubnetGN = this.getString(process.env["VPC_DB_SUBNET_GN"], config.vpcDBSubnetGN, this.vpcDBSubnetGN);

    }
}
