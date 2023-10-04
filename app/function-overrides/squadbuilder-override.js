import { generateTextInput } from "../utils/uiUtils/generateTextInput";
import {
  idSquadBuildPlayerRating,
  idSquadBuildIgnorePosition,
  idSquadBuildFromUnassigned,
  idSquadBuildPlayerCount,
} from "../app.constants";
import {
  getSquadPlayerLookup
} from "../services/club";
import { createElementFromHTML, getRangeValue, hideLoader, showLoader, } from "../utils/commonUtil";
import { generateToggleInput } from "../utils/uiUtils/generateToggleInput";
import { getValue } from "../services/repository";

export const squadBuilderOverride = () => {
  const builderViewGenerate = UTSquadBuilderView.prototype._generate;
  const onSearchComplete =
    UTSquadBuilderViewController.prototype.onClubSearchComplete;
  const playersGenerate =
    UTSquadBuilderViewModel.prototype.generatePlayerCollection;

  UTSquadBuilderView.prototype._generate = function () {
    const enhancerSetting = getValue("EnhancerSettings") || {};
    const res = builderViewGenerate.call(this);
    this.__sortContainer.append(
      createElementFromHTML(
        `<div>
        ${generateTextInput(
          "Rating",
          "10-99",
          { idSquadBuildPlayerRating },
          "(Filter players by rating range)",
          enhancerSetting.idSquadBuildPlayerRating,
          "text",
          "sb-setting"
        )}
        ${generateTextInput(
          "Count",
          "0",
          { idSquadBuildPlayerCount },
          "(Enter Players Count)",
          enhancerSetting.idSquadBuildPlayerCount,
          "text",
          "sb-setting",
          "\\d+$"
        )}
        ${generateToggleInput(
          "Ignore Position",
          { idSquadBuildIgnorePosition },
          "",
          enhancerSetting.idSquadBuildIgnorePosition,
          "sb-setting"
        )}
        ${generateToggleInput(
          "From Unassigned",
          { idSquadBuildFromUnassigned },
          "",
          enhancerSetting.idSquadBuildFromUnassigned,
          "sb-setting"
        )}
        </div>`
      )
    );
    return res;
  };

  UTSquadBuilderViewModel.prototype.generatePlayerCollection = function (
    slots,
    players,
    sbcEntity
  ) {
    const enhancerSetting = getValue("EnhancerSettings") || {};
    if (!enhancerSetting.idSquadBuildIgnorePosition) {
      return playersGenerate.call(this, slots, players, sbcEntity);
    }

    let currentIndex = 0;
    return slots.map(function (_, currentSlot) {
      var slot = sbcEntity ? sbcEntity.getSlot(currentSlot) : null;
      return slot && (slot.isValid() || slot.isBrick())
        ? slot.getItem()
        : players[currentIndex++];
    });
  };

  UTSquadBuilderViewController.prototype.onClubSearchComplete = async function (
    observer,
    response
  ) {
    showLoader();

    const enhancerSetting = getValue("EnhancerSettings") || {};

    if (enhancerSetting.idSquadBuildFromUnassigned) {
      let unassignedItems = await getUnassignedItems();
      var unassignedItemsIds = unassignedItems.map(function (unassignedItem) {
         return unassignedItem.definitionId;
      });

      console.log("response.response.items.length 0 -> " + response.response.items.length);
   
      const squadPlayersLookup = await getSquadPlayerLookup();

      const squadPlayers = unassignedItemsIds.map((currItem) => {
        if (!currItem) {
          return null;
        }
        const key = currItem;
        const clubPlayerInfo = squadPlayersLookup.get(key);
        return clubPlayerInfo;
      });

      response.response.items = squadPlayers;
    }

    console.log("response.response.items.length 1 -> " + response.response.items.length);
    const ratingVal = getRangeValue(
      enhancerSetting.idSquadBuildPlayerRating || ""
    );
    if (ratingVal.length === 2) {
      response.response.items = response.response.items.filter((x) => {
        if (x.rating < ratingVal[0] || x.rating > ratingVal[1]) {
          return false;
        }
        return true;
      });
    }

    console.log("response.response.items.length 2 -> " + response.response.items.length);
    if (ratingVal.length === 1) {
      response.response.items = response.response.items.filter((x) => {
        if (x.rating != ratingVal[0]) {
          return false;
        }
        return true;
      });
    }

    console.log("enhancerSetting.idSquadBuildPlayerCount -> "+enhancerSetting.idSquadBuildPlayerCount);
    if (enhancerSetting.idSquadBuildPlayerCount != null) {
      var count = parseInt(enhancerSetting.idSquadBuildPlayerCount);
      console.log("count -> " +count);
      console.log("response.response.items.length 3 -> " + response.response.items.length);
      if (count != 0 && response.response.items.length > count) {
        response.response.items.length = count + 1;
        console.log("response.response.items.length -> " + response.response.items.length);
      }
    }

    hideLoader();

    onSearchComplete.call(this, observer, response);
  };

  const getUnassignedItems = () => {
    return new Promise((resolve) => {
      services.Item.requestUnassignedItems().observe(
        this,
        function (sender, { response: { items } }) {
          resolve(items);
        }
      );
    });
  };
};
