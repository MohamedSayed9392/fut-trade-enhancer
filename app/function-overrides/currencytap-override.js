import { updateUserCredits } from "../services/user";

import { Auth } from "../external/amplify";

import { getValue } from "../services/repository";
import { isMarketAlertApp } from "../app.constants";

export const currencyTapOverride = () => {
  const currentTap = UTCurrencyNavigationBarView.prototype._tapDetected;
  const currentBarGenerate = UTCurrencyNavigationBarView.prototype._generate;
  const setClubInfo = UTCurrencyNavigationBarView.prototype.setClubInfo;

  UTCurrencyNavigationBarView.prototype.setClubInfo = function (
    clubName,
    clubEst
  ) {
    const res = setClubInfo.call(this, clubName, clubEst);
    const loggedInUser = getValue("loggedInUser");
    loggedInUser && (this.__clubInfoEst.textContent = loggedInUser.userName);
    return res;
  };
  UTCurrencyNavigationBarView.prototype._tapDetected = function (e) {
    const res = currentTap.call(this, e);
    if (this.__currencyCoins.contains(e.target)) {
      updateUserCredits();
    }
    return res;
  };
}