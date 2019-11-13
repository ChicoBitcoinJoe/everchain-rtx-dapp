import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare let web3: any;
declare let require: any;
let ERC20TokenArtifact = require('../../artifacts/delegated-wallet/ERC20Token.json');
let DaiTokenArtifact = require('../../artifacts/delegated-wallet/DaiToken.json');

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  public defaultList = [];
  public defaultTokens = [];

  constructor(
    private http: HttpClient,
  ) { }

  public async getToken (address) {
    let token: any = {};
    if(address == 'ether') {
      token['name'] = 'Ether';
      token['symbol'] = 'eth';
      token['balanceOf'] = async (address) => {
        return await web3.eth.getBalance(address);
      };

      token['price'] = await this.getEtherPrice();
    }
    else if (web3.utils.isAddress(address)) {
      try {
        token = await new web3.eth.Contract(ERC20TokenArtifact.abi, address);
        token['name'] = await token.methods.name().call();
        token['symbol'] = await token.methods.symbol().call();
      }
      catch (err) {
        // token didn't fit standard abi. try nonstandard token
        token = await new web3.eth.Contract(DaiTokenArtifact.abi, address);
        token['name'] = web3.utils.toAscii(await token.methods.name().call());
        token['symbol'] = web3.utils.toAscii(await token.methods.symbol().call());
      }
      token['balanceOf'] = async (address) => {
        return await token.methods.balanceOf(address).call();
      };
    }
    else {
      return new Error(address + ' is not ether or an address');
    }

    token['address'] = address;
    return token;
  }

  public async getTokens (addressList) {
    let tokens = [];
    for(let i = 0; i < addressList.length; i++) {
      let address = addressList[i];
      tokens.push(await this.getToken(address));
    }
    return tokens;
  }

  public async getBalances (address, tokenList) {
    let balances = {};
    for(let i = 0; i < tokenList.length; i++) {
      let token = await this.getToken(tokenList[i]);
      let balance = await token.balanceOf(address);
      let price = token.address == 'ether' ? await this.getEtherPrice() : null;
      balances[token.address] = {
        wei: balance,
        ether: web3.utils.fromWei(balance, 'ether'),
        usd: price
      };
    }
    return balances;
  }

  public async setDefaultTokenList (addressList) {
    this.defaultList = addressList;
    this.defaultTokens = await this.getTokens(addressList);
  }

  private getEtherPrice () {
    let url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum';
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.http.get(url).toPromise()
        resolve(result[0].current_price);
      }
      catch (err) {
        reject(err);
      }
    });
  }

}
