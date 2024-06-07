import * as dotenv from 'dotenv';
import * as process from 'process';

export type BaseParams = {
    domain?: string,
    function?: string,
    environment?: string,
}

export class BaseConfig {
    domain = 'default';
    function = 'default'
    environment = 'default'

    constructor(config: BaseParams) {
        dotenv.config();
        this.domain = this.getString(process.env["DOMAIN"], config.domain, this.domain)
        this.function = this.getString(process.env["FUNCTION"], config.function, this.function)
        this.environment = this.getString(process.env["ENVIRONMENT"], config.environment, this.environment)

    }

    namePrefix(): string {
        return `${this.domain}-${this.function}-${this.environment}`
    }

    autoResourceName(name:string): string {
        return `${this.namePrefix()}-${name}`
    }

    getNum(value: unknown, configValue: number | undefined, defaultValue: number): number {
        const parsedValue = value ? parseInt(value as string, 10) : null;
        return parsedValue ?? configValue ?? defaultValue
    }

    getString(value: string | undefined, value2: string | undefined, value3: string): string {
        return value ?? value2 ?? value3
    }

    getBool(value: boolean | undefined, value2: boolean | undefined, value3: boolean): boolean {
        return value ?? value2 ?? value3
    }
}

