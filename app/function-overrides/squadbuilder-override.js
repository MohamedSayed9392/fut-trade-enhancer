import { generateTextInput } from "../utils/uiUtils/generateTextInput";
import {
  idSquadBuildPlayerRating,
  idSquadBuildIgnorePosition,
  idSquadBuildFromUnassigned,
  idSquadBuildPlayerCount,
} from "../app.constants";
import { createElementFromHTML, getRangeValue } from "../utils/commonUtil";
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
          "sb-setting",
          "\\d+-\\d+$"
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
    const enhancerSetting = getValue("EnhancerSettings") || {};

    let unassignedItems = await getUnassignedItems();
    var unassignedItemsIds = unassignedItems.map(function (unassignedItem) {
      return unassignedItem.guidAssetId;
    });

    if (enhancerSetting.idSquadBuildFromUnassigned) {
      response.response.items = response.response.items.filter(
        (x) => !!unassignedItemsIds.includes(x.guidAssetId)
      );
    }

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

    if (ratingVal.length === 1) {
      response.response.items = response.response.items.filter((x) => {
        if (x.rating != ratingVal[0]) {
          return false;
        }
        return true;
      });
    }

    if (enhancerSetting.idSquadBuildPlayerCount) {
      var count = parseInt(enhancerSetting.idSquadBuildPlayerCount);
      if (response.response.items.length > count) {
        removeItemsAtIndexGreaterThan(
          response.response.items.length,
          count - 1
        );
      }
    }

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

  function removeItemsAtIndexGreaterThan(arr, index) {
    // Use a reverse loop to avoid issues with shifting indices when removing items
    for (let i = arr.length - 1; i > index; i--) {
      arr.splice(i, 1); // Remove the item at index i
    }
  }
};
