"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  MeshEscrowBlueprint: () => MeshEscrowBlueprint,
  MeshEscrowContract: () => MeshEscrowContract,
  MeshGiftCardBlueprint: () => MeshGiftCardBlueprint,
  MeshGiftCardContract: () => MeshGiftCardContract,
  MeshHelloWorldBlueprint: () => MeshHelloWorldBlueprint,
  MeshHelloWorldContract: () => MeshHelloWorldContract,
  MeshMarketplaceBlueprint: () => MeshMarketplaceBlueprint,
  MeshMarketplaceContract: () => MeshMarketplaceContract,
  MeshPaymentSplitterBlueprint: () => MeshPaymentSplitterBlueprint,
  MeshPaymentSplitterContract: () => MeshPaymentSplitterContract,
  MeshSwapBlueprint: () => MeshSwapBlueprint,
  MeshSwapContract: () => MeshSwapContract,
  MeshVestingBlueprint: () => MeshVestingBlueprint,
  MeshVestingContract: () => MeshVestingContract,
  activeEscrowDatum: () => activeEscrowDatum,
  initiateEscrowDatum: () => initiateEscrowDatum,
  marketplaceDatum: () => marketplaceDatum,
  recipientDepositRedeemer: () => recipientDepositRedeemer
});
module.exports = __toCommonJS(src_exports);

// src/escrow/offchain.ts
var import_common = require("@meshsdk/common");
var import_core = require("@meshsdk/core");
var import_core_csl2 = require("@meshsdk/core-csl");

// src/common.ts
var import_core_csl = require("@meshsdk/core-csl");
var MeshTxInitiator = class {
  mesh;
  fetcher;
  wallet;
  stakeCredential;
  networkId = 0;
  constructor({
    mesh,
    fetcher,
    wallet,
    networkId = 0,
    stakeCredential
  }) {
    this.mesh = mesh;
    if (fetcher) {
      this.fetcher = fetcher;
    }
    if (wallet) {
      this.wallet = wallet;
    }
    this.networkId = networkId;
    if (networkId === 1) {
      this.mesh.setNetwork("mainnet");
    } else {
      this.mesh.setNetwork("preprod");
    }
    if (stakeCredential) {
      this.stakeCredential = this.stakeCredential;
    }
  }
  signSubmitReset = async () => {
    const signedTx = this.mesh.completeSigning();
    const txHash = await this.mesh.submitTx(signedTx);
    this.mesh.reset();
    return txHash;
  };
  queryUtxos = async (walletAddress) => {
    if (this.fetcher) {
      const utxos = await this.fetcher.fetchAddressUTxOs(walletAddress);
      return utxos;
    }
    return [];
  };
  getWalletDappAddress = async () => {
    if (this.wallet) {
      const usedAddresses = await this.wallet.getUsedAddresses();
      if (usedAddresses.length > 0) {
        return usedAddresses[0];
      }
      const unusedAddresses = await this.wallet.getUnusedAddresses();
      if (unusedAddresses.length > 0) {
        return unusedAddresses[0];
      }
    }
    return "";
  };
  getWalletCollateral = async () => {
    if (this.wallet) {
      const utxos = await this.wallet.getCollateral();
      return utxos[0];
    }
    return void 0;
  };
  getWalletUtxosWithMinLovelace = async (lovelace, providedUtxos = []) => {
    let utxos = providedUtxos;
    if (this.wallet && (!providedUtxos || providedUtxos.length === 0)) {
      utxos = await this.wallet.getUtxos();
    }
    return utxos.filter((u) => {
      const lovelaceAmount = u.output.amount.find(
        (a) => a.unit === "lovelace"
      )?.quantity;
      return Number(lovelaceAmount) > lovelace;
    });
  };
  getWalletUtxosWithToken = async (assetHex, userUtxos = []) => {
    let utxos = userUtxos;
    if (this.wallet && userUtxos.length === 0) {
      utxos = await this.wallet.getUtxos();
    }
    return utxos.filter((u) => {
      const assetAmount = u.output.amount.find(
        (a) => a.unit === assetHex
      )?.quantity;
      return Number(assetAmount) >= 1;
    });
  };
  getAddressUtxosWithMinLovelace = async (walletAddress, lovelace, providedUtxos = []) => {
    let utxos = providedUtxos;
    if (this.fetcher && (!providedUtxos || providedUtxos.length === 0)) {
      utxos = await this.fetcher.fetchAddressUTxOs(walletAddress);
    }
    return utxos.filter((u) => {
      const lovelaceAmount = u.output.amount.find(
        (a) => a.unit === "lovelace"
      )?.quantity;
      return Number(lovelaceAmount) > lovelace;
    });
  };
  getAddressUtxosWithToken = async (walletAddress, assetHex, userUtxos = []) => {
    let utxos = userUtxos;
    if (this.fetcher && userUtxos.length === 0) {
      utxos = await this.fetcher.fetchAddressUTxOs(walletAddress);
    }
    return utxos.filter((u) => {
      const assetAmount = u.output.amount.find(
        (a) => a.unit === assetHex
      )?.quantity;
      return Number(assetAmount) >= 1;
    });
  };
  getWalletInfoForTx = async () => {
    const utxos = await this.wallet?.getUtxos();
    const collateral = await this.getWalletCollateral();
    const walletAddress = await this.getWalletDappAddress();
    if (!utxos || utxos?.length === 0) {
      throw new Error("No utxos found");
    }
    if (!collateral) {
      throw new Error("No collateral found");
    }
    if (!walletAddress) {
      throw new Error("No wallet address found");
    }
    return { utxos, collateral, walletAddress };
  };
  _getUtxoByTxHash = async (txHash, scriptCbor) => {
    if (this.fetcher) {
      const utxos = await this.fetcher?.fetchUTxOs(txHash);
      let scriptUtxo = utxos[0];
      if (scriptCbor) {
        const scriptAddr = (0, import_core_csl.v2ScriptToBech32)(
          scriptCbor,
          void 0,
          this.networkId
        );
        scriptUtxo = utxos.filter((utxo) => utxo.output.address === scriptAddr)[0] || utxos[0];
      }
      return scriptUtxo;
    }
    return void 0;
  };
};

// src/escrow/aiken-workspace/plutus.json
var plutus_default = {
  preamble: {
    title: "meshjs/escrow",
    description: "Aiken contracts for project 'meshjs/escrow'",
    version: "0.0.0",
    plutusVersion: "v2",
    compiler: {
      name: "Aiken",
      version: "v1.0.29-alpha+unknown"
    },
    license: "Apache-2.0"
  },
  validators: [
    {
      title: "escrow.escrow",
      datum: {
        title: "_datum",
        schema: {
          $ref: "#/definitions/escrow~1types~1EscrowDatum"
        }
      },
      redeemer: {
        title: "redeemer",
        schema: {
          $ref: "#/definitions/escrow~1types~1EscrowRedeemer"
        }
      },
      compiledCode: "590c2f01000032323232323232232323232323232232322533300d3232533300f300c3010375400226464646464646464a66602e602a60306ea80044c8c8c8c8c8c8c8c8c8c94ccc084c07c0244c8c8c8c8c8c8c94ccc0acc0b800c4c94ccc0b0c0bc00c4c94ccc0a8c080c0acdd5000899192999816181118169baa001132533302d302b302e3754006264646464a666068606e004264646464a66606a66ebc024cdd2a40046607200e660726e98014cc0e404ccc0e4dd300925eb8040045281980b9bab302730363754018660326eacc09cc0d8dd51813981b1baa00d301a011302c0073302c0022323302e3756606c0044646eb4c0e0008dd7181b0009bae3034001302c003163756606a002606a0046066002605e6ea800c58c0c4c0b8dd50008b180798169baa003302f302c37540022c601a60566ea8c070c0acdd50010b18168010b18160011bac302b302c00237586054002660506e9ccc01004c034cc0a0dd399802808806a5eb80dd598141814801181380098119baa01813232325333024302100c132323232533302b302e0031533302b0021325333029301f302a375400226464a666056605260586ea80084c94ccc0b0c0a8c0b4dd500089980500c1bae3031302e37540022c60106060605a6ea80084c8c8c8c8c8c8c8c94ccc0ccc0c4c0d0dd500089919299981a9819981b1baa0011533303532330010013303a375200666074607660706ea80092f5c044a66607400229404c94ccc0e0cc058090dd7181e8010a51133003003001303d00115333035005100414a0294058c044014dd7181c181a9baa00116300f006330143301001e00230173756606c606e006660266601e03a008602c6eacc0d400cc0d0004c0d0004c0cc008c0c4004c0b4dd50011811800981718159baa00116300c302a3754603660546ea80045858c0b0008dd6181598160011bac302a00133028374e6600802601a660506e9ccc0140440352f5c0264646464a666056605c0062a666056004264a666052603e60546ea80044c94ccc0a8c09cc0acdd500089919191919191919299981a981c001099191919191919299981c981b981d1baa00113232533303b3039303c37540022a6660766466002002660806ea400ccc100c104c0f8dd500125eb80894ccc100004528899299981f1980e0151bae304300213300300300114a060860022a66607600a200829405280b180b8059bae303e303b37540022c602a01a660346602c048010603a014660326602a046016603800a6605e008464660626eacc0e40088c8dd6981d8011bae3039001375c606e002605e00a6605a00c4646605e6eacc0dc0088c8dd6981c8011bae3037001375c606a002605a00e2c6eacc0d8004c0d8008c0d0004c0d0008dd598190009819001181800098161baa00116302e302b37540022c601860546ea8c06cc0a8dd50008b0b18160011bac302b302c00237586054002660506e9ccc01004c034cc0a0dd399802808806a5eb808c94ccc094c08cc098dd50008980819814981518139baa0014bd700a6103d87a800030153026375400244646600200200644a66605200229404c94ccc09ccdc79bae302c00200414a2266006006002605800244646600200200644a666050002297adef6c601332253330273375e603060526ea80080144cc030004dd5980d18149baa0021001302a00133002002302b001223300400223375e6028604a6ea8c058c094dd50008011119801801119baf30133024375400200444646600200200644a66604a002297ae013232533302430050021330280023300400400113300400400130290023027001223233001001323300100100322533302500114bd7009919991119198008008019129998158008801899198169ba73302d375200c6605a60540026605a605600297ae033003003302f002302d001375c60480026eacc094004cc00c00cc0a4008c09c004894ccc09000452889929998111919b89375a600e002664464a66604c6046604e6ea8004520001375a605660506ea8004c94ccc098c08cc09cdd50008a60103d87a8000132330010013756605860526ea8008894ccc0ac004530103d87a8000132323232533302c337220100042a66605866e3c0200084c05ccc0c0dd4000a5eb80530103d87a8000133006006003375a605a0066eb8c0ac008c0bc008c0b4004c8cc004004024894ccc0a80045300103d87a8000132323232533302b337220100042a66605666e3c0200084c058cc0bcdd3000a5eb80530103d87a8000133006006003375660580066eb8c0a8008c0b8008c0b0004dd7180a0009bae30160013758604e0042660060060022940c09c0048c088c08cc08c00488c8ccc00400400c0088894ccc08c00840044c8ccc010010c09c00ccccc020008dd718110009bab3023001222325333025533302800114a229405300103d87a80001301033029374c00297ae032333001001003002222533302a0021001132333004004302e0033322323300100100522533302f001133030337606ea4010dd4001a5eb7bdb1804c8c8c8c94ccc0c0cdc800400109981a19bb037520106ea001c01454ccc0c0cdc78040010992999818981798191baa001133035337606ea4024c0d8c0ccdd5000802080219299981898178008a60103d87a80001301c33035375000297ae03370000e00226606866ec0dd48011ba800133006006003375a60620066eb8c0bc008c0cc008c0c4004dd718148009bad302a001302c00230250022323300100100222533302000114bd6f7b6300999119191999804001801000911319190011919198008008019129998138008a4c264a6660500022a66604a60086eb4c09cc0a8008526161323232325333029337206eb8c0a8010dd718150018a9998149804000899803803998168018010b0b1bad302a003302d003302b002302a002302a001233302230200014a0944dd598110019bae3020002302200133002002302300122223233001001005225333022001133023337606ea4014dd300225eb7bdb1804c8c8c8c94ccc08ccdc800480109981399bb037520126e9802001454ccc08ccdc78048010992999812181118129baa001133028337606ea4028c0a4c098dd5000802080219980380480400089981399bb037520046e98004cc01801800cdd598120019bae3022002302600230240013019375401e601060326ea8c028c064dd5180e180c9baa0011632323300100100722533301c00114c0103d87a800013232533301b3375e6018603a6ea80080144c018cc07c0092f5c02660080080026040004603c002603660306ea8020dd2a40006eb0c064c068c068c068c068c068c068008dd6180c000980c180c0011bac301600130123754600260246ea80108c054004528180098081baa00223013301400114984d958c94ccc030c0280044c8c8c8c94ccc04cc0580084c8c9263300b0022323300d3756602a0044646eb4c05c008dd7180a8009bae3013001300b003163756602800260280046024002601c6ea800c54ccc030c02400454ccc03cc038dd50018a4c2c2a66601860040022a66601e601c6ea800c5261616300c37540046e1d20043001007232533300930070011323232325333010301300213232498cc0200088c8cc028dd598090011191bad3014002375c60240026eb8c040004c02000c58dd598088009808801180780098059baa0021533300930060011323232323232323253330143017002132323232498cc0380108c8cc040dd5980c0011191bad301a002375c60300026eb8c058004c038014cc0300188c8cc038dd5980b0011191bad3018002375c602c0026eb8c050004c03001c58dd5980a800980a801180980098098011bab30110013011002300f001300b37540042c60126ea800488c8cc00400400c894ccc0340045261323300300330110023003300f00125333006300430073754002264646464a66601a602000426464931929998061805000899192999808980a00109924c64a66601e601a00226464a666028602e0042649318068008b180a80098089baa0021533300f300c00113232323232325333018301b002149858dd6980c800980c8011bad30170013017002375a602a00260226ea800858c03cdd50008b180900098071baa0031533300c30090011533300f300e37540062930b0b18061baa002300600316300e001300e002300c001300837540022c464a66600c600800226464a666016601c0042930b1bae300c001300837540042a66600c600600226464a666016601c0042930b1bae300c001300837540042c600c6ea8004dc3a40046e1d20005734aae7555cf2ab9f5740ae855d101",
      hash: "8fa9284f5889972d7260c10e940a2e1acb2114bdcea845da3d52de7d"
    }
  ],
  definitions: {
    ByteArray: {
      dataType: "bytes"
    },
    Int: {
      dataType: "integer"
    },
    List$Pair$ByteArray_Int: {
      dataType: "map",
      keys: {
        $ref: "#/definitions/ByteArray"
      },
      values: {
        $ref: "#/definitions/Int"
      }
    },
    List$Pair$ByteArray_List$Pair$ByteArray_Int: {
      dataType: "map",
      keys: {
        $ref: "#/definitions/ByteArray"
      },
      values: {
        $ref: "#/definitions/List$Pair$ByteArray_Int"
      }
    },
    "Option$aiken/transaction/credential/Referenced$aiken/transaction/credential/Credential": {
      title: "Optional",
      anyOf: [
        {
          title: "Some",
          description: "An optional value.",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              $ref: "#/definitions/aiken~1transaction~1credential~1Referenced$aiken~1transaction~1credential~1Credential"
            }
          ]
        },
        {
          title: "None",
          description: "Nothing.",
          dataType: "constructor",
          index: 1,
          fields: []
        }
      ]
    },
    "aiken/transaction/credential/Address": {
      title: "Address",
      description: "A Cardano `Address` typically holding one or two credential references.\n\n Note that legacy bootstrap addresses (a.k.a. 'Byron addresses') are\n completely excluded from Plutus contexts. Thus, from an on-chain\n perspective only exists addresses of type 00, 01, ..., 07 as detailed\n in [CIP-0019 :: Shelley Addresses](https://cips.cardano.org/cip/CIP-19).",
      anyOf: [
        {
          title: "Address",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              title: "payment_credential",
              $ref: "#/definitions/aiken~1transaction~1credential~1Credential"
            },
            {
              title: "stake_credential",
              $ref: "#/definitions/Option$aiken~1transaction~1credential~1Referenced$aiken~1transaction~1credential~1Credential"
            }
          ]
        }
      ]
    },
    "aiken/transaction/credential/Credential": {
      title: "Credential",
      description: "A general structure for representing an on-chain `Credential`.\n\n Credentials are always one of two kinds: a direct public/private key\n pair, or a script (native or Plutus).",
      anyOf: [
        {
          title: "VerificationKeyCredential",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              $ref: "#/definitions/ByteArray"
            }
          ]
        },
        {
          title: "ScriptCredential",
          dataType: "constructor",
          index: 1,
          fields: [
            {
              $ref: "#/definitions/ByteArray"
            }
          ]
        }
      ]
    },
    "aiken/transaction/credential/Referenced$aiken/transaction/credential/Credential": {
      title: "Referenced",
      description: "Represent a type of object that can be represented either inline (by hash)\n or via a reference (i.e. a pointer to an on-chain location).\n\n This is mainly use for capturing pointers to a stake credential\n registration certificate in the case of so-called pointer addresses.",
      anyOf: [
        {
          title: "Inline",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              $ref: "#/definitions/aiken~1transaction~1credential~1Credential"
            }
          ]
        },
        {
          title: "Pointer",
          dataType: "constructor",
          index: 1,
          fields: [
            {
              title: "slot_number",
              $ref: "#/definitions/Int"
            },
            {
              title: "transaction_index",
              $ref: "#/definitions/Int"
            },
            {
              title: "certificate_index",
              $ref: "#/definitions/Int"
            }
          ]
        }
      ]
    },
    "escrow/types/EscrowDatum": {
      title: "EscrowDatum",
      anyOf: [
        {
          title: "Initiation",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              title: "initiator",
              $ref: "#/definitions/aiken~1transaction~1credential~1Address"
            },
            {
              title: "initiator_assets",
              $ref: "#/definitions/List$Pair$ByteArray_List$Pair$ByteArray_Int"
            }
          ]
        },
        {
          title: "ActiveEscrow",
          dataType: "constructor",
          index: 1,
          fields: [
            {
              title: "initiator",
              $ref: "#/definitions/aiken~1transaction~1credential~1Address"
            },
            {
              title: "initiator_assets",
              $ref: "#/definitions/List$Pair$ByteArray_List$Pair$ByteArray_Int"
            },
            {
              title: "recipient",
              $ref: "#/definitions/aiken~1transaction~1credential~1Address"
            },
            {
              title: "recipient_assets",
              $ref: "#/definitions/List$Pair$ByteArray_List$Pair$ByteArray_Int"
            }
          ]
        }
      ]
    },
    "escrow/types/EscrowRedeemer": {
      title: "EscrowRedeemer",
      anyOf: [
        {
          title: "RecipientDeposit",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              title: "recipient",
              $ref: "#/definitions/aiken~1transaction~1credential~1Address"
            },
            {
              title: "recipient_assets",
              $ref: "#/definitions/List$Pair$ByteArray_List$Pair$ByteArray_Int"
            }
          ]
        },
        {
          title: "CancelTrade",
          dataType: "constructor",
          index: 1,
          fields: []
        },
        {
          title: "CompleteTrade",
          dataType: "constructor",
          index: 2,
          fields: []
        }
      ]
    }
  }
};

// src/escrow/offchain.ts
var MeshEscrowBlueprint = plutus_default;
var initiateEscrowDatum = (walletAddress, amount) => {
  const { pubKeyHash, stakeCredentialHash } = (0, import_core.deserializeAddress)(walletAddress);
  return (0, import_common.conStr0)([
    (0, import_common.pubKeyAddress)(pubKeyHash, stakeCredentialHash),
    (0, import_common.value)(amount)
  ]);
};
var activeEscrowDatum = (initiationDatum, walletAddress, amount) => {
  const { pubKeyHash, stakeCredentialHash } = (0, import_core.deserializeAddress)(walletAddress);
  const [initiator, initiatorAmount] = initiationDatum.fields;
  return (0, import_common.conStr1)([
    initiator,
    initiatorAmount,
    (0, import_common.pubKeyAddress)(pubKeyHash, stakeCredentialHash),
    (0, import_common.value)(amount)
  ]);
};
var recipientDepositRedeemer = (recipient, depositAmount) => initiateEscrowDatum(recipient, depositAmount);
var MeshEscrowContract = class extends MeshTxInitiator {
  scriptCbor = (0, import_core_csl2.applyParamsToScript)(plutus_default.validators[0].compiledCode, []);
  constructor(inputs) {
    super(inputs);
  }
  initiateEscrow = async (escrowAmount) => {
    const { utxos, walletAddress } = await this.getWalletInfoForTx();
    const { address: scriptAddr } = (0, import_core.serializePlutusScript)(
      { code: this.scriptCbor, version: "V2" },
      void 0,
      this.networkId
    );
    await this.mesh.txOut(scriptAddr, escrowAmount).txOutInlineDatumValue(
      initiateEscrowDatum(walletAddress, escrowAmount),
      "JSON"
    ).changeAddress(walletAddress).selectUtxosFrom(utxos).complete();
    return this.mesh.txHex;
  };
  cancelEscrow = async (escrowUtxo) => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    const { address: scriptAddr } = (0, import_core.serializePlutusScript)(
      { code: this.scriptCbor, version: "V2" },
      void 0,
      this.networkId
    );
    const inputDatum = (0, import_core.deserializeDatum)(
      escrowUtxo.output.plutusData
    );
    if (inputDatum.constructor === 1) {
      const [
        initiatorAddressObj,
        initiatorAmount,
        recipientAddressObj,
        recipientAmount
      ] = inputDatum.fields;
      const initiatorAddress = (0, import_core.serializeAddressObj)(initiatorAddressObj);
      const recipientAddress = (0, import_core.serializeAddressObj)(recipientAddressObj);
      const initiatorToReceive = import_common.MeshValue.fromValue(initiatorAmount).toAssets();
      const recipientToReceive = import_common.MeshValue.fromValue(recipientAmount).toAssets();
      this.mesh.txOut(initiatorAddress, initiatorToReceive).txOut(recipientAddress, recipientToReceive);
    }
    await this.mesh.spendingPlutusScriptV2().txIn(
      escrowUtxo.input.txHash,
      escrowUtxo.input.outputIndex,
      escrowUtxo.output.amount,
      scriptAddr
    ).spendingReferenceTxInInlineDatumPresent().spendingReferenceTxInRedeemerValue((0, import_common.mConStr1)([])).txInScript(this.scriptCbor).requiredSignerHash((0, import_core.deserializeAddress)(walletAddress).pubKeyHash).changeAddress(walletAddress).txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    ).selectUtxosFrom(utxos).complete();
    return this.mesh.txHex;
  };
  recipientDeposit = async (escrowUtxo, depositAmount) => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    const { address: scriptAddr } = (0, import_core.serializePlutusScript)(
      { code: this.scriptCbor, version: "V2" },
      void 0,
      this.networkId
    );
    const inputDatum = (0, import_core.deserializeDatum)(
      escrowUtxo.output.plutusData
    );
    const outputDatum = activeEscrowDatum(
      inputDatum,
      walletAddress,
      depositAmount
    );
    const inputAssets = import_common.MeshValue.fromValue(inputDatum.fields[1]).toAssets();
    const escrowAmount = (0, import_core.mergeAssets)([...depositAmount, ...inputAssets]);
    await this.mesh.spendingPlutusScriptV2().txIn(
      escrowUtxo.input.txHash,
      escrowUtxo.input.outputIndex,
      escrowUtxo.output.amount,
      scriptAddr
    ).spendingReferenceTxInInlineDatumPresent().txInRedeemerValue(
      recipientDepositRedeemer(walletAddress, depositAmount),
      "JSON",
      {
        mem: 7e6,
        steps: 3e9
      }
    ).txInScript(this.scriptCbor).txOut(scriptAddr, escrowAmount).txOutInlineDatumValue(outputDatum, "JSON").changeAddress(walletAddress).txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    ).selectUtxosFrom(utxos).complete();
    return this.mesh.txHex;
  };
  completeEscrow = async (escrowUtxo) => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    const { address: scriptAddr } = (0, import_core.serializePlutusScript)(
      { code: this.scriptCbor, version: "V2" },
      void 0,
      this.networkId
    );
    const inputDatum = (0, import_core.deserializeDatum)(
      escrowUtxo.output.plutusData
    );
    const [
      initiatorAddressObj,
      initiatorAmount,
      recipientAddressObj,
      recipientAmount
    ] = inputDatum.fields;
    const initiatorAddress = (0, import_core.serializeAddressObj)(initiatorAddressObj);
    const recipientAddress = (0, import_core.serializeAddressObj)(recipientAddressObj);
    const initiatorToReceive = import_common.MeshValue.fromValue(recipientAmount).toAssets();
    const recipientToReceive = import_common.MeshValue.fromValue(initiatorAmount).toAssets();
    await this.mesh.spendingPlutusScriptV2().txIn(
      escrowUtxo.input.txHash,
      escrowUtxo.input.outputIndex,
      escrowUtxo.output.amount,
      scriptAddr
    ).spendingReferenceTxInInlineDatumPresent().spendingReferenceTxInRedeemerValue((0, import_common.mConStr2)([])).txInScript(this.scriptCbor).txOut(initiatorAddress, initiatorToReceive).txOut(recipientAddress, recipientToReceive).requiredSignerHash((0, import_core.deserializeAddress)(recipientAddress).pubKeyHash).requiredSignerHash((0, import_core.deserializeAddress)(initiatorAddress).pubKeyHash).changeAddress(walletAddress).txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    ).selectUtxosFrom(utxos).complete();
    return this.mesh.txHex;
  };
  getUtxoByTxHash = async (txHash) => {
    return await this._getUtxoByTxHash(txHash, this.scriptCbor);
  };
};

// src/giftcard/offchain.ts
var import_common3 = require("@meshsdk/common");
var import_core2 = require("@meshsdk/core");
var import_core_csl3 = require("@meshsdk/core-csl");

// src/giftcard/aiken-workspace/plutus.json
var plutus_default2 = {
  preamble: {
    title: "meshjs/giftcard",
    description: "Aiken contracts for project 'meshjs/giftcard'",
    version: "0.0.0",
    plutusVersion: "v2",
    compiler: {
      name: "Aiken",
      version: "v1.0.29-alpha+unknown"
    },
    license: "Apache-2.0"
  },
  validators: [
    {
      title: "oneshot.gift_card",
      redeemer: {
        title: "rdmr",
        schema: {
          $ref: "#/definitions/oneshot~1Action"
        }
      },
      parameters: [
        {
          title: "token_name",
          schema: {
            $ref: "#/definitions/ByteArray"
          }
        },
        {
          title: "utxo_ref",
          schema: {
            $ref: "#/definitions/aiken~1transaction~1OutputReference"
          }
        }
      ],
      compiledCode: "5901f5010000323232323232322322232323225333009323232533300c3007300d3754002264646464a666026602c00426464a666024601a60266ea803854ccc048c034c04cdd5191980080080311299980b8008a60103d87a80001323253330163375e603660306ea800804c4cdd2a40006603400497ae0133004004001301b002301900115333012300c00113371e00402029405854ccc048cdc3800a4002266e3c0080405281bad3013002375c60220022c602800264a66601e601260206ea800452f5bded8c026eacc050c044dd500099191980080099198008009bab3016301730173017301700522533301500114bd6f7b630099191919299980b19b91488100002153330163371e9101000021003100513301a337606ea4008dd3000998030030019bab3017003375c602a0046032004602e00244a666028002298103d87a800013232323253330153372200e0042a66602a66e3c01c0084cdd2a4000660326e980052f5c02980103d87a80001330060060033756602c0066eb8c050008c060008c058004dd7180998081baa00337586024002601c6ea800858c040c044008c03c004c02cdd50008a4c26cac64a66601060060022a66601660146ea8010526161533300830020011533300b300a37540082930b0b18041baa003370e90011b8748000dd7000ab9a5573aaae7955cfaba05742ae89",
      hash: "0c0d17d9095fe6b07a2727403e2c6f2dff8042ed7c300cb67a2577a2"
    },
    {
      title: "oneshot.redeem",
      datum: {
        title: "_d",
        schema: {
          $ref: "#/definitions/Data"
        }
      },
      redeemer: {
        title: "_r",
        schema: {
          $ref: "#/definitions/Data"
        }
      },
      parameters: [
        {
          title: "token_name",
          schema: {
            $ref: "#/definitions/ByteArray"
          }
        },
        {
          title: "policy_id",
          schema: {
            $ref: "#/definitions/ByteArray"
          }
        }
      ],
      compiledCode: "5901320100003232323232323223223222253330083232533300d3010002132533300b3370e6eb4c034009200113371e0020122940dd718058008b180700099299980499b8748008c028dd50008a5eb7bdb1804dd5980718059baa001323300100132330010013756601e602060206020602060186ea8c03cc030dd50019129998070008a5eb7bdb1804c8c8c8c94ccc03ccdc8a45000021533300f3371e91010000210031005133013337606ea4008dd3000998030030019bab3010003375c601c0046024004602000244a66601a002298103d87a8000132323232533300e337220140042a66601c66e3c0280084cdd2a4000660246e980052f5c02980103d87a80001330060060033756601e0066eb8c034008c044008c03c00452613656375c0026eb80055cd2ab9d5573caae7d5d02ba157441",
      hash: "39faa048196bb6b30f50815475e9d16b22e7a0ef6de5935b408ca617"
    }
  ],
  definitions: {
    ByteArray: {
      dataType: "bytes"
    },
    Data: {
      title: "Data",
      description: "Any Plutus data."
    },
    Int: {
      dataType: "integer"
    },
    "aiken/transaction/OutputReference": {
      title: "OutputReference",
      description: "An `OutputReference` is a unique reference to an output on-chain. The `output_index`\n corresponds to the position in the output list of the transaction (identified by its id)\n that produced that output",
      anyOf: [
        {
          title: "OutputReference",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              title: "transaction_id",
              $ref: "#/definitions/aiken~1transaction~1TransactionId"
            },
            {
              title: "output_index",
              $ref: "#/definitions/Int"
            }
          ]
        }
      ]
    },
    "aiken/transaction/TransactionId": {
      title: "TransactionId",
      description: "A unique transaction identifier, as the hash of a transaction body. Note that the transaction id\n isn't a direct hash of the `Transaction` as visible on-chain. Rather, they correspond to hash\n digests of transaction body as they are serialized on the network.",
      anyOf: [
        {
          title: "TransactionId",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              title: "hash",
              $ref: "#/definitions/ByteArray"
            }
          ]
        }
      ]
    },
    "oneshot/Action": {
      title: "Action",
      anyOf: [
        {
          title: "Mint",
          dataType: "constructor",
          index: 0,
          fields: []
        },
        {
          title: "Burn",
          dataType: "constructor",
          index: 1,
          fields: []
        }
      ]
    }
  }
};

// src/giftcard/offchain.ts
var MeshGiftCardBlueprint = plutus_default2;
var MeshGiftCardContract = class extends MeshTxInitiator {
  tokenNameHex = "";
  paramUtxo = { outputIndex: 0, txHash: "" };
  giftCardCbor = (tokenNameHex, utxoTxHash, utxoTxId) => {
    return (0, import_core_csl3.applyParamsToScript)(
      plutus_default2.validators[0].compiledCode,
      [(0, import_common3.builtinByteString)(tokenNameHex), (0, import_common3.txOutRef)(utxoTxHash, utxoTxId)],
      "JSON"
    );
  };
  redeemCbor = (tokenNameHex, policyId) => (0, import_core_csl3.applyParamsToScript)(plutus_default2.validators[1].compiledCode, [
    tokenNameHex,
    policyId
  ]);
  constructor(inputs, tokenNameHex, paramUtxo) {
    super(inputs);
    if (tokenNameHex) {
      this.tokenNameHex = tokenNameHex;
    }
    if (paramUtxo) {
      this.paramUtxo = paramUtxo;
    }
  }
  createGiftCard = async (tokenName2, giftValue) => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    const tokenNameHex = (0, import_common3.stringToHex)(tokenName2);
    const firstUtxo = utxos[0];
    if (firstUtxo === void 0) throw new Error("No UTXOs available");
    const remainingUtxos = utxos.slice(1);
    const giftCardScript = this.giftCardCbor(
      tokenNameHex,
      firstUtxo.input.txHash,
      firstUtxo.input.outputIndex
    );
    const giftCardPolicy = (0, import_core2.resolveScriptHash)(giftCardScript, "V2");
    const redeemScript = {
      code: this.redeemCbor(tokenNameHex, giftCardPolicy),
      version: "V2"
    };
    const redeemAddr = (0, import_core2.serializePlutusScript)(
      redeemScript,
      void 0,
      this.networkId
    ).address;
    await this.mesh.txIn(
      firstUtxo.input.txHash,
      firstUtxo.input.outputIndex,
      firstUtxo.output.amount,
      firstUtxo.output.address
    ).mintPlutusScriptV2().mint("1", giftCardPolicy, tokenNameHex).mintingScript(giftCardScript).mintRedeemerValue((0, import_common3.mConStr0)([])).txOut(redeemAddr, [
      ...giftValue,
      { unit: giftCardPolicy + tokenNameHex, quantity: "1" }
    ]).txOutInlineDatumValue([
      firstUtxo.input.txHash,
      firstUtxo.input.outputIndex,
      tokenNameHex
    ]).changeAddress(walletAddress).txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    ).selectUtxosFrom(remainingUtxos).complete();
    this.tokenNameHex = tokenNameHex;
    this.paramUtxo = firstUtxo.input;
    return this.mesh.txHex;
  };
  redeemGiftCard = async (giftCardUtxo) => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    const inlineDatum = (0, import_core2.deserializeDatum)(
      giftCardUtxo.output.plutusData
    ).list;
    const paramTxHash = inlineDatum[0].bytes;
    const paramTxId = inlineDatum[1].int;
    const tokenNameHex = inlineDatum[2].bytes;
    const giftCardScript = this.giftCardCbor(
      tokenNameHex,
      paramTxHash,
      paramTxId
    );
    const giftCardPolicy = (0, import_core2.resolveScriptHash)(giftCardScript, "V2");
    const redeemScript = this.redeemCbor(tokenNameHex, giftCardPolicy);
    await this.mesh.spendingPlutusScriptV2().txIn(
      giftCardUtxo.input.txHash,
      giftCardUtxo.input.outputIndex,
      giftCardUtxo.output.amount,
      giftCardUtxo.output.address
    ).spendingReferenceTxInInlineDatumPresent().spendingReferenceTxInRedeemerValue("").txInScript(redeemScript).mintPlutusScriptV2().mint("-1", giftCardPolicy, tokenNameHex).mintingScript(giftCardScript).mintRedeemerValue((0, import_common3.mConStr1)([])).changeAddress(walletAddress).txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    ).selectUtxosFrom(utxos).complete();
    return this.mesh.txHex;
  };
  getUtxoByTxHash = async (txHash) => {
    return await this._getUtxoByTxHash(txHash);
  };
};

// src/hello-world/offchain.ts
var import_core3 = require("@meshsdk/core");
var import_core_csl4 = require("@meshsdk/core-csl");

// src/hello-world/aiken-workspace/plutus.json
var plutus_default3 = {
  preamble: {
    title: "meshjs/aiken",
    description: "Aiken on MeshJS",
    version: "0.0.0",
    plutusVersion: "v2",
    compiler: {
      name: "Aiken",
      version: "v1.0.29-alpha+unknown"
    },
    license: "Apache-2.0"
  },
  validators: [
    {
      title: "hello_world.hello_world",
      datum: {
        title: "datum",
        schema: {
          $ref: "#/definitions/hello_world~1Datum"
        }
      },
      redeemer: {
        title: "redeemer",
        schema: {
          $ref: "#/definitions/hello_world~1Redeemer"
        }
      },
      compiledCode: "58e901000032323232323223223225333006323253330083371e6eb8c008c028dd5002a4410d48656c6c6f2c20576f726c642100100114a06644646600200200644a66601c00229404c94ccc030cdc79bae301000200414a226600600600260200026eb0c02cc030c030c030c030c030c030c030c030c024dd5180098049baa002375c600260126ea80188c02c0045261365653330043370e900018029baa001132325333009300b002149858dd7180480098031baa0011653330023370e900018019baa0011323253330073009002149858dd7180380098021baa001165734aae7555cf2ab9f5742ae881",
      hash: "c1fe430f19ac248a8a7ea47db106002c4327e542c3fdc60ad6481103"
    }
  ],
  definitions: {
    ByteArray: {
      dataType: "bytes"
    },
    "hello_world/Datum": {
      title: "Datum",
      anyOf: [
        {
          title: "Datum",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              title: "owner",
              $ref: "#/definitions/ByteArray"
            }
          ]
        }
      ]
    },
    "hello_world/Redeemer": {
      title: "Redeemer",
      anyOf: [
        {
          title: "Redeemer",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              title: "msg",
              $ref: "#/definitions/ByteArray"
            }
          ]
        }
      ]
    }
  }
};

// src/hello-world/offchain.ts
var MeshHelloWorldBlueprint = plutus_default3;
var MeshHelloWorldContract = class extends MeshTxInitiator {
  scriptCbor = (0, import_core_csl4.applyParamsToScript)(plutus_default3.validators[0].compiledCode, []);
  constructor(inputs) {
    super(inputs);
  }
  getScript = () => {
    const { address } = (0, import_core3.serializePlutusScript)(
      { code: this.scriptCbor, version: "V2" },
      void 0,
      this.networkId
    );
    return {
      scriptAddr: address
    };
  };
  lockAsset = async (assets) => {
    const { utxos, walletAddress } = await this.getWalletInfoForTx();
    const { scriptAddr } = this.getScript();
    const signerHash = (0, import_core3.deserializeAddress)(walletAddress).pubKeyHash;
    await this.mesh.txOut(scriptAddr, assets).txOutDatumHashValue((0, import_core3.mConStr0)([signerHash])).changeAddress(walletAddress).selectUtxosFrom(utxos).complete();
    return this.mesh.txHex;
  };
  unlockAsset = async (scriptUtxo, message) => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    const signerHash = (0, import_core3.deserializeAddress)(walletAddress).pubKeyHash;
    await this.mesh.spendingPlutusScriptV2().txIn(
      scriptUtxo.input.txHash,
      scriptUtxo.input.outputIndex,
      scriptUtxo.output.amount,
      scriptUtxo.output.address
    ).txInScript(this.scriptCbor).txInRedeemerValue((0, import_core3.mConStr0)([(0, import_core3.stringToHex)(message)])).txInDatumValue((0, import_core3.mConStr0)([signerHash])).requiredSignerHash(signerHash).changeAddress(walletAddress).txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    ).selectUtxosFrom(utxos).complete();
    return this.mesh.txHex;
  };
  getUtxoByTxHash = async (txHash) => {
    return await this._getUtxoByTxHash(txHash, this.scriptCbor);
  };
};

// src/marketplace/offchain.ts
var import_common6 = require("@meshsdk/common");
var import_core4 = require("@meshsdk/core");
var import_core_csl5 = require("@meshsdk/core-csl");

// src/marketplace/aiken-workspace/plutus.json
var plutus_default4 = {
  preamble: {
    title: "meshjs/marketplace",
    description: "Aiken contracts for project 'meshjs/marketplace'",
    version: "0.0.0",
    plutusVersion: "v2",
    compiler: {
      name: "Aiken",
      version: "v1.0.29-alpha+unknown"
    },
    license: "Apache-2.0"
  },
  validators: [
    {
      title: "marketplace.marketplace",
      datum: {
        title: "datum",
        schema: {
          $ref: "#/definitions/marketplace~1types~1MarketplaceDatum"
        }
      },
      redeemer: {
        title: "redeemer",
        schema: {
          $ref: "#/definitions/marketplace~1types~1MarketplaceRedeemer"
        }
      },
      parameters: [
        {
          title: "owner",
          schema: {
            $ref: "#/definitions/aiken~1transaction~1credential~1Address"
          }
        },
        {
          title: "fee_percentage_basis_point",
          schema: {
            $ref: "#/definitions/Int"
          }
        }
      ],
      compiledCode: "59082f01000032323232323232223223232322322533300b3232533300d3007300e375400226464a64666020601660226ea80204c94ccc044c030c048dd500089919191919191919299980c99299980e8008a501533301d302000114a22940cc88c8cc00400400c894ccc08000452f5c026464a66603e66ebcc044c084dd5180a18109baa00200513302300233004004001133004004001302400230220013758601660366ea8c02cc06cdd50079805980d9baa300e301b37540102a6660320022004294052819801998011bac3004301a3754601460346ea803805cc018cdc199b82375a601a60346ea805005520a09c0133002330013758600660326ea8c024c064dd50069804980c9baa0133005337006eb4c030c064dd50099998021bab300c30193754601860326ea801922010048810022323300100100322533301d00114bd6f7b63009991299980e19baf300e301e375400400a2646660020020046eacc048c07cdd50019112999811001080089919980200218130019991191980080080291299981380089981419bb037520086e9800d2f5bded8c0264646464a66605066e400200084cc0b0cdd81ba9008374c00e00a2a66605066e3c0200084c94ccc0a4c090c0a8dd500089981699bb03752012605c60566ea80040104010c94ccc0a54ccc0b00045288a5014c0103d87a80001301a3302d374c00297ae032333001001008002222533302e0021001132333004004303200333223233001001005225333033001133034337606ea4010dd4001a5eb7bdb1804c8c8c8c94ccc0d0cdc800400109981c19bb037520106ea001c01454ccc0d0cdc7804001099299981a9818181b1baa001133039337606ea4024c0e8c0dcdd5000802080219299981a98180008a60103d87a80001302633039375000297ae03370000e00226607066ec0dd48011ba800133006006003375a606a0066eb8c0cc008c0dc008c0d4004dd718168009bad302e001303000213302c337606ea4008dd3000998030030019bab3029003375c604e004605600460520026eb8c084004dd5981100098120010800980f800998010011810000911919800800991980080080191299980e8008a5eb804c8ccc888c8cc00400400c894ccc08c004400c4c8cc094dd3998129ba90063302530220013302530230014bd7019801801981380118128009bae301c0013756603a002660060066042004603e00244a66603800229444c94ccc068c8cdc49bad3007001333008006375c601a0026eb8c040004dd6180f8010998018018008a50301f0012301a301b301b0012223253330173011301837540022900009bad301c3019375400264a66602e602260306ea8004530103d87a8000132330010013756603a60346ea8008894ccc070004530103d87a8000132323232533301d337220100042a66603a66e3c0200084c038cc084dd4000a5eb80530103d87a8000133006006003375a603c0066eb8c070008c080008c078004c8cc004004010894ccc06c0045300103d87a8000132323232533301c337220100042a66603866e3c0200084c034cc080dd3000a5eb80530103d87a80001330060060033756603a0066eb8c06c008c07c008c07400494ccc04cc03800452f5bded8c0264646600200297adef6c6022533301900113301a337609801014000374c00697adef6c60132323232533301a3372091010000213301e337609801014000374c00e00a2a66603466e3d2210000213301e337609801014000374c00e00626603c66ec0dd48011ba600133006006003375660360066eb8c064008c074008c06c004c8cc0040052f5bded8c044a66603000226603266ec13001014000375000697adef6c6013232323253330193372091010000213301d337609801014000375000e00a2a66603266e3d2210000213301d337609801014000375000e00626603a66ec0dd48011ba800133006006003375a60340066eb8c060008c070008c068004c058c04cdd50008b19198008009bac300330133754600660266ea801c894ccc054004530103d87a80001323253330143375e600c602c6ea800801c4c014cc0600092f5c02660080080026032004602e002264a666022601860246ea80044cc88c8cc00400400c894ccc060004528099299980b19b8f375c603600400829444cc00c00c004c06c004dd6180b180b980b980b980b980b980b980b980b98099baa30033013375400e6eb8c058c04cdd50008b192999808980618091baa001130023301530163013375400297ae014c0103d87a8000300230123754600460246ea8030dd2a4000460280026024601e6ea8004528180098071baa00223011301200114984d958c94ccc028c01400454ccc034c030dd50010a4c2c2a66601460080022a66601a60186ea80085261616300a375400264a666010600660126ea80104c8c8c8c8c8c8c8c94ccc04cc0580084c9265333010300b3011375400e264646464a66602e6034004264649319299980b180880089919299980d980f00109924c64a666032602800226464a66603c604200426493180a0008b180f800980d9baa002153330193013001132323232323253330223025002149858dd6981180098118011bad30210013021002375a603e00260366ea800858c064dd50008b180e000980c1baa00315333016301000115333019301837540062930b0b180b1baa002300d003163018001301800230160013012375400e2c2c6eb8c050004c050008dd7180900098090011bad30100013010002300e001300a37540082c464a666012600800226464a66601c60220042930b1bae300f001300b37540042a666012600600226464a66601c60220042930b1bae300f001300b37540042c60126ea8004dc3a40046e1d2000375a002ae6955ceaab9e5573eae815d0aba21",
      hash: "96dbc09c69d812e157d42967587c459b60f5dd21b1902312045586c4"
    }
  ],
  definitions: {
    ByteArray: {
      dataType: "bytes"
    },
    Int: {
      dataType: "integer"
    },
    "Option$aiken/transaction/credential/Referenced$aiken/transaction/credential/Credential": {
      title: "Optional",
      anyOf: [
        {
          title: "Some",
          description: "An optional value.",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              $ref: "#/definitions/aiken~1transaction~1credential~1Referenced$aiken~1transaction~1credential~1Credential"
            }
          ]
        },
        {
          title: "None",
          description: "Nothing.",
          dataType: "constructor",
          index: 1,
          fields: []
        }
      ]
    },
    "aiken/transaction/credential/Address": {
      title: "Address",
      description: "A Cardano `Address` typically holding one or two credential references.\n\n Note that legacy bootstrap addresses (a.k.a. 'Byron addresses') are\n completely excluded from Plutus contexts. Thus, from an on-chain\n perspective only exists addresses of type 00, 01, ..., 07 as detailed\n in [CIP-0019 :: Shelley Addresses](https://cips.cardano.org/cip/CIP-19).",
      anyOf: [
        {
          title: "Address",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              title: "payment_credential",
              $ref: "#/definitions/aiken~1transaction~1credential~1Credential"
            },
            {
              title: "stake_credential",
              $ref: "#/definitions/Option$aiken~1transaction~1credential~1Referenced$aiken~1transaction~1credential~1Credential"
            }
          ]
        }
      ]
    },
    "aiken/transaction/credential/Credential": {
      title: "Credential",
      description: "A general structure for representing an on-chain `Credential`.\n\n Credentials are always one of two kinds: a direct public/private key\n pair, or a script (native or Plutus).",
      anyOf: [
        {
          title: "VerificationKeyCredential",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              $ref: "#/definitions/ByteArray"
            }
          ]
        },
        {
          title: "ScriptCredential",
          dataType: "constructor",
          index: 1,
          fields: [
            {
              $ref: "#/definitions/ByteArray"
            }
          ]
        }
      ]
    },
    "aiken/transaction/credential/Referenced$aiken/transaction/credential/Credential": {
      title: "Referenced",
      description: "Represent a type of object that can be represented either inline (by hash)\n or via a reference (i.e. a pointer to an on-chain location).\n\n This is mainly use for capturing pointers to a stake credential\n registration certificate in the case of so-called pointer addresses.",
      anyOf: [
        {
          title: "Inline",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              $ref: "#/definitions/aiken~1transaction~1credential~1Credential"
            }
          ]
        },
        {
          title: "Pointer",
          dataType: "constructor",
          index: 1,
          fields: [
            {
              title: "slot_number",
              $ref: "#/definitions/Int"
            },
            {
              title: "transaction_index",
              $ref: "#/definitions/Int"
            },
            {
              title: "certificate_index",
              $ref: "#/definitions/Int"
            }
          ]
        }
      ]
    },
    "marketplace/types/MarketplaceDatum": {
      title: "MarketplaceDatum",
      anyOf: [
        {
          title: "MarketplaceDatum",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              title: "seller",
              $ref: "#/definitions/aiken~1transaction~1credential~1Address"
            },
            {
              title: "price",
              $ref: "#/definitions/Int"
            },
            {
              title: "policy",
              $ref: "#/definitions/ByteArray"
            },
            {
              title: "tokenName",
              $ref: "#/definitions/ByteArray"
            }
          ]
        }
      ]
    },
    "marketplace/types/MarketplaceRedeemer": {
      title: "MarketplaceRedeemer",
      anyOf: [
        {
          title: "Buy",
          dataType: "constructor",
          index: 0,
          fields: []
        },
        {
          title: "Close",
          dataType: "constructor",
          index: 1,
          fields: []
        }
      ]
    }
  }
};

// src/marketplace/offchain.ts
var MeshMarketplaceBlueprint = plutus_default4;
var marketplaceDatum = (sellerAddress, lovelaceFee, assetHex) => {
  const { pubKeyHash, stakeCredentialHash } = (0, import_core4.deserializeAddress)(sellerAddress);
  const { policyId, assetName } = (0, import_common6.parseAssetUnit)(assetHex);
  return (0, import_common6.conStr0)([
    (0, import_common6.pubKeyAddress)(pubKeyHash, stakeCredentialHash),
    (0, import_common6.integer)(lovelaceFee),
    (0, import_common6.currencySymbol)(policyId),
    (0, import_common6.tokenName)(assetName)
  ]);
};
var MeshMarketplaceContract = class extends MeshTxInitiator {
  ownerAddress;
  feePercentageBasisPoint;
  scriptCbor;
  constructor(inputs, ownerAddress, feePercentageBasisPoint) {
    super(inputs);
    this.ownerAddress = ownerAddress;
    this.feePercentageBasisPoint = feePercentageBasisPoint;
    const { pubKeyHash, stakeCredentialHash } = (0, import_core4.deserializeAddress)(ownerAddress);
    this.scriptCbor = (0, import_core_csl5.applyParamsToScript)(
      plutus_default4.validators[0].compiledCode,
      [
        (0, import_common6.pubKeyAddress)(pubKeyHash, stakeCredentialHash),
        (0, import_common6.integer)(feePercentageBasisPoint)
      ],
      "JSON"
    );
  }
  listAsset = async (asset, price) => {
    const { utxos, walletAddress } = await this.getWalletInfoForTx();
    const assetMap = /* @__PURE__ */ new Map();
    assetMap.set(asset, "1");
    const { address: scriptAddr } = (0, import_core4.serializePlutusScript)(
      { code: this.scriptCbor, version: "V2" },
      void 0,
      this.networkId
    );
    const tokenForSale = [{ unit: asset, quantity: "1" }];
    const outputDatum = marketplaceDatum(walletAddress, price, asset);
    await this.mesh.txOut(scriptAddr, tokenForSale).txOutInlineDatumValue(outputDatum, "JSON").changeAddress(walletAddress).selectUtxosFrom(utxos).complete();
    return this.mesh.txHex;
  };
  delistAsset = async (marketplaceUtxo) => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    await this.mesh.spendingPlutusScriptV2().txIn(
      marketplaceUtxo.input.txHash,
      marketplaceUtxo.input.outputIndex,
      marketplaceUtxo.output.amount,
      marketplaceUtxo.output.address
    ).spendingReferenceTxInInlineDatumPresent().spendingReferenceTxInRedeemerValue((0, import_common6.mConStr1)([])).txInScript(this.scriptCbor).changeAddress(walletAddress).requiredSignerHash((0, import_core4.deserializeAddress)(walletAddress).pubKeyHash).txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    ).selectUtxosFrom(utxos).complete();
    return this.mesh.txHex;
  };
  purchaseAsset = async (marketplaceUtxo) => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    const inputDatum = (0, import_core4.deserializeDatum)(
      marketplaceUtxo.output.plutusData
    );
    const inputLovelace = marketplaceUtxo.output.amount.find(
      (a) => a.unit === "lovelace"
    ).quantity;
    const tx = this.mesh.spendingPlutusScriptV2().txIn(
      marketplaceUtxo.input.txHash,
      marketplaceUtxo.input.outputIndex,
      marketplaceUtxo.output.amount,
      marketplaceUtxo.output.address
    ).spendingReferenceTxInInlineDatumPresent().spendingReferenceTxInRedeemerValue((0, import_common6.mConStr0)([])).txInScript(this.scriptCbor).changeAddress(walletAddress).txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    ).selectUtxosFrom(utxos);
    let ownerToReceiveLovelace = inputDatum.fields[1].int * this.feePercentageBasisPoint / 1e4;
    if (this.feePercentageBasisPoint > 0 && ownerToReceiveLovelace < 1e6) {
      ownerToReceiveLovelace = 1e6;
    }
    if (ownerToReceiveLovelace > 0) {
      const ownerAddress = this.ownerAddress;
      const ownerToReceive = [
        {
          unit: "lovelace",
          quantity: Math.ceil(ownerToReceiveLovelace).toString()
        }
      ];
      tx.txOut(ownerAddress, ownerToReceive);
    }
    const sellerToReceiveLovelace = inputDatum.fields[1].int + Number(inputLovelace);
    if (sellerToReceiveLovelace > 0) {
      const sellerAddress = (0, import_core4.serializeAddressObj)(inputDatum.fields[0]);
      const sellerToReceive = [
        {
          unit: "lovelace",
          quantity: sellerToReceiveLovelace.toString()
        }
      ];
      tx.txOut(sellerAddress, sellerToReceive);
    }
    await tx.complete();
    return this.mesh.txHex;
  };
  relistAsset = async (marketplaceUtxo, newPrice) => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    const inputAsset = marketplaceUtxo.output.amount.find(
      (a) => a.unit !== "lovelace"
    ).unit;
    const tokenForSale = [{ unit: inputAsset, quantity: "1" }];
    const outputDatum = marketplaceDatum(walletAddress, newPrice, inputAsset);
    const { address: scriptAddr } = (0, import_core4.serializePlutusScript)(
      { code: this.scriptCbor, version: "V2" },
      void 0,
      this.networkId
    );
    await this.mesh.spendingPlutusScriptV2().txIn(
      marketplaceUtxo.input.txHash,
      marketplaceUtxo.input.outputIndex,
      marketplaceUtxo.output.amount,
      marketplaceUtxo.output.address
    ).spendingReferenceTxInInlineDatumPresent().spendingReferenceTxInRedeemerValue((0, import_common6.mConStr1)([])).txInScript(this.scriptCbor).txOut(scriptAddr, tokenForSale).txOutInlineDatumValue(outputDatum, "JSON").changeAddress(walletAddress).requiredSignerHash((0, import_core4.deserializeAddress)(walletAddress).pubKeyHash).txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    ).selectUtxosFrom(utxos).complete();
    return this.mesh.txHex;
  };
  getUtxoByTxHash = async (txHash) => {
    return await this._getUtxoByTxHash(txHash, this.scriptCbor);
  };
};

// src/payment-splitter/offchain.ts
var import_common8 = require("@meshsdk/common");
var import_core5 = require("@meshsdk/core");
var import_core_csl6 = require("@meshsdk/core-csl");

// src/payment-splitter/aiken-workspace/plutus.json
var plutus_default5 = {
  preamble: {
    title: "fabianbormann/payment-splitter",
    description: "Aiken contracts for project 'fabianbormann/payment-splitter'",
    version: "0.1.0",
    plutusVersion: "v2",
    compiler: {
      name: "Aiken",
      version: "v1.0.29-alpha+unknown"
    },
    license: "Apache-2.0"
  },
  validators: [
    {
      title: "payment_splitter.payout",
      datum: {
        title: "_datum",
        schema: {
          $ref: "#/definitions/payment_splitter~1Datum"
        }
      },
      redeemer: {
        title: "_redeemer",
        schema: {
          $ref: "#/definitions/payment_splitter~1Redeemer"
        }
      },
      parameters: [
        {
          title: "scriptHashes",
          schema: {
            $ref: "#/definitions/List$ByteArray"
          }
        }
      ],
      compiledCode: "5903a5010000323232323232322322322322533300832323232323232323232323253330143375e6e9cccc8c0040048894ccc06800440084ccc00c00cc8c8cc004004010894ccc07400452f5c026464a66603866ebc00801440044cc080008cc010010004c084008c07c004c070004c074004cc8c004004894ccc06400452f5c026466036002660060066600e603a004466603066ebc00400928251301b001323300100100722533301900114bd7009980d1806180c1baa300c3018375460360026600400460380020169801018000100114a0646600200200444a66603000229444c94ccc058cdc39bad301b00233005533301900414c0103d87a80001300e3301a301b0044bd70240002660060060022940c06c004c8cc004004028894ccc05c00452f5c02660306ea0c8c8c8c8c8c94ccc068cdc424000002266e04008cdc08009802005880119980119804806919baf3010301c3754602060386ea8c014c070dd5000803240004466e00004c014dd59803180e9baa3006301d375400466600266010014466ebcc03cc06cdd51807980d9baa0010054800088cdc000098021bab3005301c3754004444646600200200844a66603e0022008266006604200266004004604400246600c64a66603066e1d200230193754002298103d87a8000132330010013756603c60366ea8008894ccc074004530103d87a8000132323232533301e33722911000021533301e3371e9101000021301633022375000297ae014c0103d87a8000133006006003375a603e0066eb8c074008c084008c07c004c8cc004004008894ccc0700045300103d87a8000132323232533301d33722911000021533301d3371e9101000021301533021374c00297ae014c0103d87a80001330060060033756603c0066eb8c070008c080008c07800520002301b301c001301900133002002301a0012253330133370e9001180a1baa00210011375a6030602a6ea800888c8cc00400400c894ccc05c00452f5c026464a66602c600a00426603400466008008002266008008002603600460320026eacc050c054008dd61809800980998098011bac3011001300d37546002601a6ea80108c040004c8cc004004020894ccc03800452f5c026601e60066601e602000297ae0330020023011001374a90000a4c26caca66600c66e1d20003007375400226464a666016601c0042930b1bae300c001300837540022ca66600866e1d20003005375400226464a66601260180042930b1bae300a001300637540022c6eb00055cd2ab9d5573caae7d5d02ba157441",
      hash: "0776032753d2900f7c1e933af4108c53851e10ca95fa10e34af90277"
    }
  ],
  definitions: {
    ByteArray: {
      dataType: "bytes"
    },
    List$ByteArray: {
      dataType: "list",
      items: {
        $ref: "#/definitions/ByteArray"
      }
    },
    "payment_splitter/Datum": {
      title: "Datum",
      anyOf: [
        {
          title: "Datum",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              title: "owner",
              $ref: "#/definitions/ByteArray"
            }
          ]
        }
      ]
    },
    "payment_splitter/Redeemer": {
      title: "Redeemer",
      anyOf: [
        {
          title: "Redeemer",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              title: "message",
              $ref: "#/definitions/ByteArray"
            }
          ]
        }
      ]
    }
  }
};

// src/payment-splitter/offchain.ts
var MeshPaymentSplitterBlueprint = plutus_default5;
var MeshPaymentSplitterContract = class extends MeshTxInitiator {
  wrapPayees = (payees) => (0, import_common8.list)(
    payees.map(
      (payee) => (0, import_common8.builtinByteString)((0, import_core5.deserializeAddress)(payee).pubKeyHash)
    )
  );
  scriptCbor = () => (0, import_core_csl6.applyParamsToScript)(
    plutus_default5.validators[0].compiledCode,
    [this.wrapPayees(this.payees)],
    "JSON"
  );
  payees = [];
  constructor(inputs, payees) {
    super(inputs);
    if (inputs.wallet) {
      if (inputs.wallet instanceof import_core5.MeshWallet) {
        this.payees = [inputs.wallet.getUsedAddresses()[0], ...payees];
      }
      if (inputs.wallet instanceof import_core5.BrowserWallet) {
        inputs.wallet.getUsedAddresses().then((addresses) => {
          this.payees = [addresses[0], ...payees];
        });
      }
    } else {
      this.payees = payees;
      console.warn(
        "Wallet not provided. Therefore the payment address will not be added to the payees list which makes it impossible to trigger the payout."
      );
    }
  }
  sendLovelaceToSplitter = async (lovelaceAmount) => {
    if (this.wallet === null || this.wallet === void 0) {
      throw new Error("Wallet not provided");
    }
    const { walletAddress } = await this.getWalletInfoForTx();
    const script = {
      code: this.scriptCbor(),
      version: "V2"
    };
    const { address: scriptAddress } = (0, import_core5.serializePlutusScript)(
      script,
      void 0,
      0
    );
    const { pubKeyHash } = (0, import_core5.deserializeAddress)(walletAddress);
    const datum = {
      alternative: 0,
      fields: [pubKeyHash]
    };
    const tx = new import_core5.Transaction({ initiator: this.wallet }).sendLovelace(
      {
        address: scriptAddress,
        datum: { value: datum }
      },
      lovelaceAmount.toString()
    );
    const unsignedTx = await tx.build();
    return unsignedTx;
  };
  triggerPayout = async () => {
    if (this.wallet === null || this.wallet === void 0) {
      throw new Error("Wallet not provided");
    }
    const { walletAddress, collateral } = await this.getWalletInfoForTx();
    const script = {
      code: this.scriptCbor(),
      version: "V2"
    };
    const { address: scriptAddress } = (0, import_core5.serializePlutusScript)(
      script,
      void 0,
      0
    );
    const utxos = await this.fetcher?.fetchAddressUTxOs(scriptAddress) || [];
    const { pubKeyHash } = (0, import_core5.deserializeAddress)(walletAddress);
    const datum = {
      alternative: 0,
      fields: [pubKeyHash]
    };
    const redeemerData = "Hello, World!";
    const redeemer = { data: { alternative: 0, fields: [redeemerData] } };
    let tx = new import_core5.Transaction({ initiator: this.wallet });
    let split = 0;
    for (const utxo of utxos) {
      const amount = utxo.output?.amount;
      if (amount) {
        let lovelace = amount.find((asset) => asset.unit === "lovelace");
        if (lovelace) {
          split += Math.floor(Number(lovelace.quantity) / this.payees.length);
        }
        tx = tx.redeemValue({
          value: utxo,
          script,
          datum,
          redeemer
        });
      }
    }
    tx = tx.setCollateral([collateral]);
    for (const payee of this.payees) {
      tx = tx.sendLovelace(payee, split.toString());
    }
    tx = tx.setRequiredSigners([walletAddress]);
    const unsignedTx = await tx.build();
    return unsignedTx;
  };
};

// src/swap/offchain.ts
var import_common10 = require("@meshsdk/common");
var import_core6 = require("@meshsdk/core");
var import_core_csl7 = require("@meshsdk/core-csl");

// src/swap/aiken-workspace/plutus.json
var plutus_default6 = {
  preamble: {
    title: "meshjs/swap",
    description: "Aiken contracts for project 'meshjs/swap'",
    version: "0.0.0",
    plutusVersion: "v2",
    compiler: {
      name: "Aiken",
      version: "v1.0.29-alpha+unknown"
    },
    license: "Apache-2.0"
  },
  validators: [
    {
      title: "swap.swap",
      datum: {
        title: "datum",
        schema: {
          $ref: "#/definitions/swap~1SwapDatum"
        }
      },
      redeemer: {
        title: "redeemer",
        schema: {
          $ref: "#/definitions/swap~1SwapRedeemer"
        }
      },
      compiledCode: "590827010000323232323232322323232232253330083232533300a3007300b375400226464a6466601a6014601c6ea80204c94ccc038c030c03cdd5000899191919191919191919299980c299980d8048a501533301b301e00914a2294054ccc06000440085280a50330043330030084bd6f7b63011299980c99baf300e301b3754602260366ea800802c4cc010004dd59808980d9baa3011301b37540042002600c6eacc03cc064dd500b19801999119980200125eb7bdb180894ccc068cdd79807980e1baa0020031330050013756602460386ea80084004dd61802180c1baa300b3018375401e601660306ea8054c014dd59802180c1baa0152232333001001003002222533301d00210011323330040043021003333300b002375c60380026eacc074004888c94ccc07d4ccc0880045288a5014c103d87a80001301333023374c00297ae0323330010010030022225333024002100113233300400430280033322323300100100522533302900113302a337606ea4010dd4001a5eb7bdb1804c8c8c8c94ccc0a8cdc800400109981719bb037520106ea001c01454ccc0a8cdc78040010992999815981498161baa00113302f337606ea4024c0c0c0b4dd5000802080219299981598148008a60103d87a80001301f3302f375000297ae03370000e00226605c66ec0dd48011ba800133006006003375a60560066eb8c0a4008c0b4008c0ac004dd718118009bad30240013026002301f002222323300100100422533301c0011004133003301e00133002002301f001223233001001323300100100322533301b00114bd7009919991119198008008019129998108008801899198119ba733023375200c66046604000266046604200297ae03300300330250023023001375c60340026eacc06c004cc00c00cc07c008c074004894ccc068004528899299980c1919b89375a600e002664464a6660386032603a6ea8004520001375a6042603c6ea8004c94ccc070c064c074dd50008a6103d87a80001323300100137566044603e6ea8008894ccc084004530103d87a80001323232325333022337220100042a66604466e3c0200084c058cc098dd4000a5eb80530103d87a8000133006006003375a60460066eb8c084008c094008c08c004c8cc004004024894ccc0800045300103d87a80001323232325333021337220100042a66604266e3c0200084c054cc094dd3000a5eb80530103d87a8000133006006003375660440066eb8c080008c090008c088004dd718070009bae30110013758603a0042660060060022940c0740048c060c064c0640048c8cc004004008894ccc05c00452f5bded8c02664464646666010006004002444c646400464646600200200644a66603c002293099299980f8008a99980e18021bad301e30210021498584c8c8c8c94ccc080cdc81bae3021004375c60420062a666040601000226600e00e660480060042c2c6eb4c08400cc09000cc088008c084008c0840048ccc064c05c00528251375660320066eb8c05c008c064004cc008008c0680048888c8cc004004014894ccc0640044cc068cdd81ba9005374c00897adef6c60132323232533301a3372001200426603c66ec0dd48049ba60080051533301a3371e012004264a666036603260386ea80044cc07ccdd81ba900a3020301d3754002008200866600e01201000226603c66ec0dd48011ba600133006006003375660360066eb8c064008c074008c06c004c8cc004004dd6180298091baa30053012375401244a666028002297ae01323253330133375e6010602a6ea8c02cc054dd500100289980b80119802002000899802002000980c001180b000980198081baa300630103754602660206ea800458c8cc004004dd6180198081baa30033010375400e44a666024002298103d87a80001323253330113375e600c60266ea800801c4c014cc0540092f5c0266008008002602c0046028002264a66601c6018601e6ea80044cc88c8cc00400400c894ccc054004528099299980999b8f375c603000400829444cc00c00c004c060004dd61809980a180a180a180a180a180a180a180a18081baa30033010375400e6eb8c04cc040dd50008b192999807180618079baa001130023301230133010375400297ae014c0103d87a80003002300f37546004601e6ea8030dd2a400046022002601e60186ea8004528180098059baa0022300e300f00114984d958c94ccc01cc01400454ccc028c024dd50010a4c2c2a66600e60080022a66601460126ea80085261616300737540026464a66600c6008600e6ea80144c8c8c8c8c8c94ccc03cc0480084c8c8c926330090032323300b375660240044646eb4c050008dd718090009bae3010001330080042323300a375660220044646eb4c04c008dd718088009bae300f001533300c300a300d375400a264646464a666026602c0042646493192999809180800089919299980b980d00109924c64a66602a602600226464a666034603a0042649318098008b180d800980b9baa0021533301530120011323232323232533301e3021002149858dd6980f800980f8011bad301d001301d002375a6036002602e6ea800858c054dd50008b180c000980a1baa00315333012300f00115333015301437540062930b0b18091baa002300c00316301400130140023012001300e375400a2c2c6eacc040004c040008dd598070009807001180600098041baa0051622323300100100322533300c00114984c8cc00c00cc040008c00cc0380048c94ccc018c0100044c8c94ccc02cc03800852616375c601800260106ea800854ccc018c00c0044c8c94ccc02cc03800852616375c601800260106ea800858c018dd50009b8748008dc3a4000ae6955ceaab9e5573eae815d0aba201",
      hash: "5db0485a71b88eb31dec330bcf994509ea24b709498f90f9b1863902"
    }
  ],
  definitions: {
    ByteArray: {
      dataType: "bytes"
    },
    Int: {
      dataType: "integer"
    },
    List$Pair$ByteArray_Int: {
      dataType: "map",
      keys: {
        $ref: "#/definitions/ByteArray"
      },
      values: {
        $ref: "#/definitions/Int"
      }
    },
    List$Pair$ByteArray_List$Pair$ByteArray_Int: {
      dataType: "map",
      keys: {
        $ref: "#/definitions/ByteArray"
      },
      values: {
        $ref: "#/definitions/List$Pair$ByteArray_Int"
      }
    },
    "Option$aiken/transaction/credential/Referenced$aiken/transaction/credential/Credential": {
      title: "Optional",
      anyOf: [
        {
          title: "Some",
          description: "An optional value.",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              $ref: "#/definitions/aiken~1transaction~1credential~1Referenced$aiken~1transaction~1credential~1Credential"
            }
          ]
        },
        {
          title: "None",
          description: "Nothing.",
          dataType: "constructor",
          index: 1,
          fields: []
        }
      ]
    },
    "aiken/transaction/credential/Address": {
      title: "Address",
      description: "A Cardano `Address` typically holding one or two credential references.\n\n Note that legacy bootstrap addresses (a.k.a. 'Byron addresses') are\n completely excluded from Plutus contexts. Thus, from an on-chain\n perspective only exists addresses of type 00, 01, ..., 07 as detailed\n in [CIP-0019 :: Shelley Addresses](https://cips.cardano.org/cip/CIP-19).",
      anyOf: [
        {
          title: "Address",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              title: "payment_credential",
              $ref: "#/definitions/aiken~1transaction~1credential~1Credential"
            },
            {
              title: "stake_credential",
              $ref: "#/definitions/Option$aiken~1transaction~1credential~1Referenced$aiken~1transaction~1credential~1Credential"
            }
          ]
        }
      ]
    },
    "aiken/transaction/credential/Credential": {
      title: "Credential",
      description: "A general structure for representing an on-chain `Credential`.\n\n Credentials are always one of two kinds: a direct public/private key\n pair, or a script (native or Plutus).",
      anyOf: [
        {
          title: "VerificationKeyCredential",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              $ref: "#/definitions/ByteArray"
            }
          ]
        },
        {
          title: "ScriptCredential",
          dataType: "constructor",
          index: 1,
          fields: [
            {
              $ref: "#/definitions/ByteArray"
            }
          ]
        }
      ]
    },
    "aiken/transaction/credential/Referenced$aiken/transaction/credential/Credential": {
      title: "Referenced",
      description: "Represent a type of object that can be represented either inline (by hash)\n or via a reference (i.e. a pointer to an on-chain location).\n\n This is mainly use for capturing pointers to a stake credential\n registration certificate in the case of so-called pointer addresses.",
      anyOf: [
        {
          title: "Inline",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              $ref: "#/definitions/aiken~1transaction~1credential~1Credential"
            }
          ]
        },
        {
          title: "Pointer",
          dataType: "constructor",
          index: 1,
          fields: [
            {
              title: "slot_number",
              $ref: "#/definitions/Int"
            },
            {
              title: "transaction_index",
              $ref: "#/definitions/Int"
            },
            {
              title: "certificate_index",
              $ref: "#/definitions/Int"
            }
          ]
        }
      ]
    },
    "swap/SwapDatum": {
      title: "SwapDatum",
      anyOf: [
        {
          title: "SwapDatum",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              title: "initiator",
              $ref: "#/definitions/aiken~1transaction~1credential~1Address"
            },
            {
              title: "to_provide",
              $ref: "#/definitions/List$Pair$ByteArray_List$Pair$ByteArray_Int"
            },
            {
              title: "to_receive",
              $ref: "#/definitions/List$Pair$ByteArray_List$Pair$ByteArray_Int"
            }
          ]
        }
      ]
    },
    "swap/SwapRedeemer": {
      title: "SwapRedeemer",
      anyOf: [
        {
          title: "Cancel",
          dataType: "constructor",
          index: 0,
          fields: []
        },
        {
          title: "Swap",
          dataType: "constructor",
          index: 1,
          fields: []
        }
      ]
    }
  }
};

// src/swap/offchain.ts
var MeshSwapBlueprint = plutus_default6;
var MeshSwapContract = class extends MeshTxInitiator {
  scriptCbor = (0, import_core_csl7.applyParamsToScript)(plutus_default6.validators[0].compiledCode, []);
  scriptAddress;
  constructor(inputs) {
    super(inputs);
    this.scriptAddress = (0, import_core6.serializePlutusScript)(
      { code: this.scriptCbor, version: "V2" },
      void 0,
      0
    ).address;
  }
  initiateSwap = async (toProvide, toReceive) => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    const { pubKeyHash, stakeCredentialHash } = (0, import_core6.deserializeAddress)(walletAddress);
    const swapDatum = (0, import_common10.conStr0)([
      (0, import_common10.pubKeyAddress)(pubKeyHash, stakeCredentialHash),
      (0, import_common10.value)(toProvide),
      (0, import_common10.value)(toReceive)
    ]);
    await this.mesh.txOut(this.scriptAddress, toProvide).txOutInlineDatumValue(swapDatum, "JSON").changeAddress(walletAddress).txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    ).selectUtxosFrom(utxos).complete();
    return this.mesh.txHex;
  };
  acceptSwap = async (swapUtxo) => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    const inlineDatum = (0, import_core6.deserializeDatum)(
      swapUtxo.output.plutusData
    );
    const initiatorAddress = (0, import_core6.serializeAddressObj)(inlineDatum.fields[0]);
    const initiatorToReceive = inlineDatum.fields[2];
    await this.mesh.spendingPlutusScriptV2().txIn(
      swapUtxo.input.txHash,
      swapUtxo.input.outputIndex,
      swapUtxo.output.amount,
      swapUtxo.output.address
    ).spendingReferenceTxInInlineDatumPresent().spendingReferenceTxInRedeemerValue((0, import_common10.mConStr1)([])).txInScript(this.scriptCbor).txOut(
      initiatorAddress,
      import_common10.MeshValue.fromValue(initiatorToReceive).toAssets()
    ).changeAddress(walletAddress).txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    ).selectUtxosFrom(utxos).complete();
    return this.mesh.txHex;
  };
  cancelSwap = async (swapUtxo) => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    const inlineDatum = (0, import_core6.deserializeDatum)(
      swapUtxo.output.plutusData
    );
    const initiatorAddress = (0, import_core6.serializeAddressObj)(inlineDatum.fields[0]);
    await this.mesh.spendingPlutusScriptV2().txIn(
      swapUtxo.input.txHash,
      swapUtxo.input.outputIndex,
      swapUtxo.output.amount,
      swapUtxo.output.address
    ).spendingReferenceTxInInlineDatumPresent().spendingReferenceTxInRedeemerValue((0, import_common10.mConStr0)([])).txInScript(this.scriptCbor).changeAddress(walletAddress).txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    ).requiredSignerHash((0, import_core6.deserializeAddress)(initiatorAddress).pubKeyHash).selectUtxosFrom(utxos).complete();
    return this.mesh.txHex;
  };
  getUtxoByTxHash = async (txHash) => {
    return await this._getUtxoByTxHash(txHash, this.scriptCbor);
  };
};

// src/vesting/offchain.ts
var import_common12 = require("@meshsdk/common");
var import_core7 = require("@meshsdk/core");
var import_core_csl8 = require("@meshsdk/core-csl");

// src/vesting/aiken-workspace/plutus.json
var plutus_default7 = {
  preamble: {
    title: "meshjs/vesting",
    description: "Aiken contracts for project 'meshjs/vesting'",
    version: "0.0.0",
    plutusVersion: "v2",
    compiler: {
      name: "Aiken",
      version: "v1.0.29-alpha+unknown"
    },
    license: "Apache-2.0"
  },
  validators: [
    {
      title: "vesting.vesting",
      datum: {
        title: "datum",
        schema: {
          $ref: "#/definitions/vesting~1types~1VestingDatum"
        }
      },
      redeemer: {
        title: "_redeemer",
        schema: {
          $ref: "#/definitions/Data"
        }
      },
      compiledCode: "5901c40100003232323232323223222533300532533233007300130083754600460126ea800c4c8c8c94ccc028cc004dd6180118061baa3003300c375400c6eb8c014c030dd50048a511533300a330013758600460186ea8c00cc030dd50031bae300f30103010300c3754012266446464646464a666022601660246ea80084c94ccc0480104cdc40038008011bad301630133754004002264a666022601660246ea80084c94ccc0480100084cdc48038009bad3016301337540040022940c050008cdc424000601e6ea8c04cc050004cc044c048004cc044ccc034cdc424000601c6ea8c048c04c00530103d87a80004c0103d87980004bd7018071baa3005300e3754004601e602060206020602060206020602060186ea8c00cc030dd50031bad3003300c3754012294088c8cc00400400c894ccc040004528099299980719b8f375c602600400829444cc00c00c004c04c0048c038c03cc03cc03cc03cc03cc03cc03cc03c0048c034004dc3a400429408c02cc0300045261365653330023370e900018019baa0011323232323232533300b300e002149858dd7180600098060011bae300a001300a002375a601000260086ea8004595cd2ab9d5573caae7d5d02ba157441",
      hash: "ac96a3fa3cabf670268a88720402c715ed5fd73ffb3276e6092ead00"
    }
  ],
  definitions: {
    ByteArray: {
      dataType: "bytes"
    },
    Data: {
      title: "Data",
      description: "Any Plutus data."
    },
    Int: {
      dataType: "integer"
    },
    "vesting/types/VestingDatum": {
      title: "VestingDatum",
      anyOf: [
        {
          title: "VestingDatum",
          dataType: "constructor",
          index: 0,
          fields: [
            {
              title: "lock_until",
              description: "POSIX time in second, e.g. 1672843961000",
              $ref: "#/definitions/Int"
            },
            {
              title: "owner",
              description: "Owner's credentials",
              $ref: "#/definitions/ByteArray"
            },
            {
              title: "beneficiary",
              description: "Beneficiary's credentials",
              $ref: "#/definitions/ByteArray"
            }
          ]
        }
      ]
    }
  }
};

// src/vesting/offchain.ts
var MeshVestingBlueprint = plutus_default7;
var MeshVestingContract = class extends MeshTxInitiator {
  scriptCbor = (0, import_core_csl8.applyParamsToScript)(plutus_default7.validators[0].compiledCode, []);
  constructor(inputs) {
    super(inputs);
  }
  depositFund = async (amount, lockUntilTimeStampMs, beneficiary) => {
    const { utxos, walletAddress } = await this.getWalletInfoForTx();
    const scriptAddr = (0, import_core7.serializePlutusScript)(
      { code: this.scriptCbor, version: "V2" },
      void 0,
      0
    ).address;
    const { pubKeyHash: ownerPubKeyHash } = (0, import_core7.deserializeAddress)(walletAddress);
    const { pubKeyHash: beneficiaryPubKeyHash } = (0, import_core7.deserializeAddress)(beneficiary);
    await this.mesh.txOut(scriptAddr, amount).txOutInlineDatumValue(
      (0, import_common12.mConStr0)([
        lockUntilTimeStampMs,
        ownerPubKeyHash,
        beneficiaryPubKeyHash
      ])
    ).changeAddress(walletAddress).selectUtxosFrom(utxos).complete();
    return this.mesh.txHex;
  };
  withdrawFund = async (vestingUtxo) => {
    const { utxos, walletAddress, collateral } = await this.getWalletInfoForTx();
    const { input: collateralInput, output: collateralOutput } = collateral;
    const scriptAddr = (0, import_core7.serializePlutusScript)(
      { code: this.scriptCbor, version: "V2" },
      void 0,
      0
    ).address;
    const { pubKeyHash } = (0, import_core7.deserializeAddress)(walletAddress);
    const datum = (0, import_core7.deserializeDatum)(
      vestingUtxo.output.plutusData
    );
    const invalidBefore = (0, import_common12.unixTimeToEnclosingSlot)(
      Math.min(datum.fields[0].int, Date.now() - 15e3),
      this.networkId === 0 ? import_common12.SLOT_CONFIG_NETWORK.preprod : import_common12.SLOT_CONFIG_NETWORK.mainnet
    ) + 1;
    await this.mesh.spendingPlutusScriptV2().txIn(
      vestingUtxo.input.txHash,
      vestingUtxo.input.outputIndex,
      vestingUtxo.output.amount,
      scriptAddr
    ).spendingReferenceTxInInlineDatumPresent().spendingReferenceTxInRedeemerValue("").txInScript(this.scriptCbor).txOut(walletAddress, []).txInCollateral(
      collateralInput.txHash,
      collateralInput.outputIndex,
      collateralOutput.amount,
      collateralOutput.address
    ).invalidBefore(invalidBefore).requiredSignerHash(pubKeyHash).changeAddress(walletAddress).selectUtxosFrom(utxos).complete();
    return this.mesh.txHex;
  };
  getUtxoByTxHash = async (txHash) => {
    return await this._getUtxoByTxHash(txHash, this.scriptCbor);
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MeshEscrowBlueprint,
  MeshEscrowContract,
  MeshGiftCardBlueprint,
  MeshGiftCardContract,
  MeshHelloWorldBlueprint,
  MeshHelloWorldContract,
  MeshMarketplaceBlueprint,
  MeshMarketplaceContract,
  MeshPaymentSplitterBlueprint,
  MeshPaymentSplitterContract,
  MeshSwapBlueprint,
  MeshSwapContract,
  MeshVestingBlueprint,
  MeshVestingContract,
  activeEscrowDatum,
  initiateEscrowDatum,
  marketplaceDatum,
  recipientDepositRedeemer
});
