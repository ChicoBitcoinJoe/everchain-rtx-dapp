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
      console.log('ERROR', address);
      return new Error(address + ' is not ether or an address');
    }

    token['address'] = address;
    return token;
  }

  public async getTokens (tokenList) {
    let tokens = [];
    for(let i = 0; i < tokenList.length; i++) {
      tokens.push(await this.getToken(tokenList[i]));
    }
    return tokens;
  }

  public async getBalance (address, token) {
    let balance = await token.balanceOf(address);
    let price = token.address == 'ether' ? await this.getEtherPrice() : null;
    return {
      wei: balance,
      value: web3.utils.fromWei(balance, 'ether'),
      usd: price
    };
  }

  public async getBalances (address, tokens) {
    let balances = {};
    for(let i = 0; i < tokens.length; i++) {
      balances[tokens[i].address] = await this.getBalance(address, tokens[i]);
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
