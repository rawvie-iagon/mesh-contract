import * as _meshsdk_common from '@meshsdk/common';
import { ConStr0, PubKeyAddress, Value, ConStr1, Integer as Integer$1, CurrencySymbol, TokenName, Asset as Asset$1, UTxO as UTxO$1, BuiltinByteString as BuiltinByteString$1 } from '@meshsdk/common';
import { MeshTxBuilder, IFetcher, BrowserWallet, MeshWallet, UTxO, Asset, ConStr0 as ConStr0$1, Integer, BuiltinByteString } from '@meshsdk/core';

type MeshTxInitiatorInput = {
    mesh: MeshTxBuilder;
    fetcher?: IFetcher;
    wallet?: BrowserWallet | MeshWallet;
    networkId?: number;
    stakeCredential?: string;
};
declare class MeshTxInitiator {
    mesh: MeshTxBuilder;
    fetcher?: IFetcher;
    wallet?: BrowserWallet | MeshWallet;
    stakeCredential?: string;
    networkId: number;
    constructor({ mesh, fetcher, wallet, networkId, stakeCredential, }: MeshTxInitiatorInput);
    protected signSubmitReset: () => Promise<string | undefined>;
    protected queryUtxos: (walletAddress: string) => Promise<UTxO[]>;
    protected getWalletDappAddress: () => Promise<string | undefined>;
    protected getWalletCollateral: () => Promise<UTxO | undefined>;
    protected getWalletUtxosWithMinLovelace: (lovelace: number, providedUtxos?: UTxO[]) => Promise<UTxO[]>;
    protected getWalletUtxosWithToken: (assetHex: string, userUtxos?: UTxO[]) => Promise<UTxO[]>;
    protected getAddressUtxosWithMinLovelace: (walletAddress: string, lovelace: number, providedUtxos?: UTxO[]) => Promise<UTxO[]>;
    protected getAddressUtxosWithToken: (walletAddress: string, assetHex: string, userUtxos?: UTxO[]) => Promise<UTxO[]>;
    protected getWalletInfoForTx: () => Promise<{
        utxos: UTxO[];
        collateral: UTxO;
        walletAddress: string;
    }>;
    protected _getUtxoByTxHash: (txHash: string, scriptCbor?: string) => Promise<UTxO | undefined>;
}

declare const MeshEscrowBlueprint: {
    preamble: {
        title: string;
        description: string;
        version: string;
        plutusVersion: string;
        compiler: {
            name: string;
            version: string;
        };
        license: string;
    };
    validators: {
        title: string;
        datum: {
            title: string;
            schema: {
                $ref: string;
            };
        };
        redeemer: {
            title: string;
            schema: {
                $ref: string;
            };
        };
        compiledCode: string;
        hash: string;
    }[];
    definitions: {
        ByteArray: {
            dataType: string;
        };
        Int: {
            dataType: string;
        };
        List$Pair$ByteArray_Int: {
            dataType: string;
            keys: {
                $ref: string;
            };
            values: {
                $ref: string;
            };
        };
        List$Pair$ByteArray_List$Pair$ByteArray_Int: {
            dataType: string;
            keys: {
                $ref: string;
            };
            values: {
                $ref: string;
            };
        };
        "Option$aiken/transaction/credential/Referenced$aiken/transaction/credential/Credential": {
            title: string;
            anyOf: {
                title: string;
                description: string;
                dataType: string;
                index: number;
                fields: {
                    $ref: string;
                }[];
            }[];
        };
        "aiken/transaction/credential/Address": {
            title: string;
            description: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            }[];
        };
        "aiken/transaction/credential/Credential": {
            title: string;
            description: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    $ref: string;
                }[];
            }[];
        };
        "aiken/transaction/credential/Referenced$aiken/transaction/credential/Credential": {
            title: string;
            description: string;
            anyOf: ({
                title: string;
                dataType: string;
                index: number;
                fields: {
                    $ref: string;
                }[];
            } | {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            })[];
        };
        "escrow/types/EscrowDatum": {
            title: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            }[];
        };
        "escrow/types/EscrowRedeemer": {
            title: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            }[];
        };
    };
};
type InitiationDatum = ConStr0<[PubKeyAddress, Value]>;
declare const initiateEscrowDatum: (walletAddress: string, amount: Asset[]) => InitiationDatum;
type ActiveEscrowDatum = ConStr1<[
    PubKeyAddress,
    Value,
    PubKeyAddress,
    Value
]>;
declare const activeEscrowDatum: (initiationDatum: InitiationDatum, walletAddress: string, amount: Asset[]) => ActiveEscrowDatum;
type RecipientDepositRedeemer = ConStr0<[PubKeyAddress, Value]>;
declare const recipientDepositRedeemer: (recipient: string, depositAmount: Asset[]) => InitiationDatum;
declare class MeshEscrowContract extends MeshTxInitiator {
    scriptCbor: string;
    constructor(inputs: MeshTxInitiatorInput);
    initiateEscrow: (escrowAmount: Asset[]) => Promise<string>;
    cancelEscrow: (escrowUtxo: UTxO) => Promise<string>;
    recipientDeposit: (escrowUtxo: UTxO, depositAmount: Asset[]) => Promise<string>;
    completeEscrow: (escrowUtxo: UTxO) => Promise<string>;
    getUtxoByTxHash: (txHash: string) => Promise<UTxO | undefined>;
}

declare const MeshGiftCardBlueprint: {
    preamble: {
        title: string;
        description: string;
        version: string;
        plutusVersion: string;
        compiler: {
            name: string;
            version: string;
        };
        license: string;
    };
    validators: ({
        title: string;
        redeemer: {
            title: string;
            schema: {
                $ref: string;
            };
        };
        parameters: {
            title: string;
            schema: {
                $ref: string;
            };
        }[];
        compiledCode: string;
        hash: string;
        datum?: undefined;
    } | {
        title: string;
        datum: {
            title: string;
            schema: {
                $ref: string;
            };
        };
        redeemer: {
            title: string;
            schema: {
                $ref: string;
            };
        };
        parameters: {
            title: string;
            schema: {
                $ref: string;
            };
        }[];
        compiledCode: string;
        hash: string;
    })[];
    definitions: {
        ByteArray: {
            dataType: string;
        };
        Data: {
            title: string;
            description: string;
        };
        Int: {
            dataType: string;
        };
        "aiken/transaction/OutputReference": {
            title: string;
            description: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            }[];
        };
        "aiken/transaction/TransactionId": {
            title: string;
            description: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            }[];
        };
        "oneshot/Action": {
            title: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: never[];
            }[];
        };
    };
};
declare class MeshGiftCardContract extends MeshTxInitiator {
    tokenNameHex: string;
    paramUtxo: UTxO["input"];
    giftCardCbor: (tokenNameHex: string, utxoTxHash: string, utxoTxId: number) => string;
    redeemCbor: (tokenNameHex: string, policyId: string) => string;
    constructor(inputs: MeshTxInitiatorInput, tokenNameHex?: string, paramUtxo?: UTxO["input"]);
    createGiftCard: (tokenName: string, giftValue: Asset[]) => Promise<string>;
    redeemGiftCard: (giftCardUtxo: UTxO) => Promise<string>;
    getUtxoByTxHash: (txHash: string) => Promise<UTxO | undefined>;
}

type HelloWorldDatum = ConStr0$1<[
    Integer,
    BuiltinByteString,
    BuiltinByteString
]>;
declare const MeshHelloWorldBlueprint: {
    preamble: {
        title: string;
        description: string;
        version: string;
        plutusVersion: string;
        compiler: {
            name: string;
            version: string;
        };
        license: string;
    };
    validators: {
        title: string;
        datum: {
            title: string;
            schema: {
                $ref: string;
            };
        };
        redeemer: {
            title: string;
            schema: {
                $ref: string;
            };
        };
        compiledCode: string;
        hash: string;
    }[];
    definitions: {
        ByteArray: {
            dataType: string;
        };
        "hello_world/Datum": {
            title: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            }[];
        };
        "hello_world/Redeemer": {
            title: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            }[];
        };
    };
};
declare class MeshHelloWorldContract extends MeshTxInitiator {
    scriptCbor: string;
    constructor(inputs: MeshTxInitiatorInput);
    getScript: () => {
        scriptAddr: string;
    };
    lockAsset: (assets: Asset[]) => Promise<string>;
    unlockAsset: (scriptUtxo: UTxO, message: string) => Promise<string>;
    getUtxoByTxHash: (txHash: string) => Promise<UTxO | undefined>;
}

declare const MeshMarketplaceBlueprint: {
    preamble: {
        title: string;
        description: string;
        version: string;
        plutusVersion: string;
        compiler: {
            name: string;
            version: string;
        };
        license: string;
    };
    validators: {
        title: string;
        datum: {
            title: string;
            schema: {
                $ref: string;
            };
        };
        redeemer: {
            title: string;
            schema: {
                $ref: string;
            };
        };
        parameters: {
            title: string;
            schema: {
                $ref: string;
            };
        }[];
        compiledCode: string;
        hash: string;
    }[];
    definitions: {
        ByteArray: {
            dataType: string;
        };
        Int: {
            dataType: string;
        };
        "Option$aiken/transaction/credential/Referenced$aiken/transaction/credential/Credential": {
            title: string;
            anyOf: {
                title: string;
                description: string;
                dataType: string;
                index: number;
                fields: {
                    $ref: string;
                }[];
            }[];
        };
        "aiken/transaction/credential/Address": {
            title: string;
            description: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            }[];
        };
        "aiken/transaction/credential/Credential": {
            title: string;
            description: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    $ref: string;
                }[];
            }[];
        };
        "aiken/transaction/credential/Referenced$aiken/transaction/credential/Credential": {
            title: string;
            description: string;
            anyOf: ({
                title: string;
                dataType: string;
                index: number;
                fields: {
                    $ref: string;
                }[];
            } | {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            })[];
        };
        "marketplace/types/MarketplaceDatum": {
            title: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            }[];
        };
        "marketplace/types/MarketplaceRedeemer": {
            title: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: never[];
            }[];
        };
    };
};
type MarketplaceDatum = ConStr0<[
    PubKeyAddress,
    Integer$1,
    CurrencySymbol,
    TokenName
]>;
declare const marketplaceDatum: (sellerAddress: string, lovelaceFee: number, assetHex: string) => MarketplaceDatum;
declare class MeshMarketplaceContract extends MeshTxInitiator {
    ownerAddress: string;
    feePercentageBasisPoint: number;
    scriptCbor: string;
    constructor(inputs: MeshTxInitiatorInput, ownerAddress: string, feePercentageBasisPoint: number);
    listAsset: (asset: string, price: number) => Promise<string>;
    delistAsset: (marketplaceUtxo: UTxO) => Promise<string>;
    purchaseAsset: (marketplaceUtxo: UTxO) => Promise<string>;
    relistAsset: (marketplaceUtxo: UTxO, newPrice: number) => Promise<string>;
    getUtxoByTxHash: (txHash: string) => Promise<UTxO | undefined>;
}

declare const MeshPaymentSplitterBlueprint: {
    preamble: {
        title: string;
        description: string;
        version: string;
        plutusVersion: string;
        compiler: {
            name: string;
            version: string;
        };
        license: string;
    };
    validators: {
        title: string;
        datum: {
            title: string;
            schema: {
                $ref: string;
            };
        };
        redeemer: {
            title: string;
            schema: {
                $ref: string;
            };
        };
        parameters: {
            title: string;
            schema: {
                $ref: string;
            };
        }[];
        compiledCode: string;
        hash: string;
    }[];
    definitions: {
        ByteArray: {
            dataType: string;
        };
        List$ByteArray: {
            dataType: string;
            items: {
                $ref: string;
            };
        };
        "payment_splitter/Datum": {
            title: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            }[];
        };
        "payment_splitter/Redeemer": {
            title: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            }[];
        };
    };
};
declare class MeshPaymentSplitterContract extends MeshTxInitiator {
    wrapPayees: (payees: string[]) => _meshsdk_common.List<_meshsdk_common.BuiltinByteString>;
    scriptCbor: () => string;
    payees: string[];
    constructor(inputs: MeshTxInitiatorInput, payees: string[]);
    sendLovelaceToSplitter: (lovelaceAmount: number) => Promise<string>;
    triggerPayout: () => Promise<string>;
}

declare const MeshSwapBlueprint: {
    preamble: {
        title: string;
        description: string;
        version: string;
        plutusVersion: string;
        compiler: {
            name: string;
            version: string;
        };
        license: string;
    };
    validators: {
        title: string;
        datum: {
            title: string;
            schema: {
                $ref: string;
            };
        };
        redeemer: {
            title: string;
            schema: {
                $ref: string;
            };
        };
        compiledCode: string;
        hash: string;
    }[];
    definitions: {
        ByteArray: {
            dataType: string;
        };
        Int: {
            dataType: string;
        };
        List$Pair$ByteArray_Int: {
            dataType: string;
            keys: {
                $ref: string;
            };
            values: {
                $ref: string;
            };
        };
        List$Pair$ByteArray_List$Pair$ByteArray_Int: {
            dataType: string;
            keys: {
                $ref: string;
            };
            values: {
                $ref: string;
            };
        };
        "Option$aiken/transaction/credential/Referenced$aiken/transaction/credential/Credential": {
            title: string;
            anyOf: {
                title: string;
                description: string;
                dataType: string;
                index: number;
                fields: {
                    $ref: string;
                }[];
            }[];
        };
        "aiken/transaction/credential/Address": {
            title: string;
            description: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            }[];
        };
        "aiken/transaction/credential/Credential": {
            title: string;
            description: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    $ref: string;
                }[];
            }[];
        };
        "aiken/transaction/credential/Referenced$aiken/transaction/credential/Credential": {
            title: string;
            description: string;
            anyOf: ({
                title: string;
                dataType: string;
                index: number;
                fields: {
                    $ref: string;
                }[];
            } | {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            })[];
        };
        "swap/SwapDatum": {
            title: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    $ref: string;
                }[];
            }[];
        };
        "swap/SwapRedeemer": {
            title: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: never[];
            }[];
        };
    };
};
type SwapDatum = ConStr0<[PubKeyAddress, Value, Value]>;
declare class MeshSwapContract extends MeshTxInitiator {
    scriptCbor: string;
    scriptAddress: string;
    constructor(inputs: MeshTxInitiatorInput);
    initiateSwap: (toProvide: Asset$1[], toReceive: Asset$1[]) => Promise<string>;
    acceptSwap: (swapUtxo: UTxO$1) => Promise<string>;
    cancelSwap: (swapUtxo: UTxO$1) => Promise<string>;
    getUtxoByTxHash: (txHash: string) => Promise<UTxO$1 | undefined>;
}

declare const MeshVestingBlueprint: {
    preamble: {
        title: string;
        description: string;
        version: string;
        plutusVersion: string;
        compiler: {
            name: string;
            version: string;
        };
        license: string;
    };
    validators: {
        title: string;
        datum: {
            title: string;
            schema: {
                $ref: string;
            };
        };
        redeemer: {
            title: string;
            schema: {
                $ref: string;
            };
        };
        compiledCode: string;
        hash: string;
    }[];
    definitions: {
        ByteArray: {
            dataType: string;
        };
        Data: {
            title: string;
            description: string;
        };
        Int: {
            dataType: string;
        };
        "vesting/types/VestingDatum": {
            title: string;
            anyOf: {
                title: string;
                dataType: string;
                index: number;
                fields: {
                    title: string;
                    description: string;
                    $ref: string;
                }[];
            }[];
        };
    };
};
type VestingDatum = ConStr0<[
    Integer$1,
    BuiltinByteString$1,
    BuiltinByteString$1
]>;
declare class MeshVestingContract extends MeshTxInitiator {
    scriptCbor: string;
    constructor(inputs: MeshTxInitiatorInput);
    depositFund: (amount: Asset[], lockUntilTimeStampMs: number, beneficiary: string) => Promise<string>;
    withdrawFund: (vestingUtxo: UTxO) => Promise<string>;
    getUtxoByTxHash: (txHash: string) => Promise<UTxO | undefined>;
}

export { type ActiveEscrowDatum, type HelloWorldDatum, type InitiationDatum, type MarketplaceDatum, MeshEscrowBlueprint, MeshEscrowContract, MeshGiftCardBlueprint, MeshGiftCardContract, MeshHelloWorldBlueprint, MeshHelloWorldContract, MeshMarketplaceBlueprint, MeshMarketplaceContract, MeshPaymentSplitterBlueprint, MeshPaymentSplitterContract, MeshSwapBlueprint, MeshSwapContract, MeshVestingBlueprint, MeshVestingContract, type RecipientDepositRedeemer, type SwapDatum, type VestingDatum, activeEscrowDatum, initiateEscrowDatum, marketplaceDatum, recipientDepositRedeemer };
