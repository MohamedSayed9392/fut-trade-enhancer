import { appendCardPrice, appendSectionPrices } from "../utils/priceAppendUtil";

export const unassignedListOverride = () => {
  const unassignedList = UTUnassignedItemsView.prototype.renderSection;
  UTUnassignedItemsView.prototype.renderSection = function(e, t, i, o, ...args) {
    const result = unassignedList.call(this, e, t, i, o, ...args);
    
    var element = this.sections[t];

    var sectionHeader = t == 0 ? "Unassigned.Items" : "Unassigned.Dublicates"
    appendSectionPrices({
      listRows: element.listRows.map(({ __root, __auction, data }) => ({
        __root,
        __auction,
        data,
      })),
      headerElement: $(element._header.__root),
      isRelistSupported: true,
      sectionHeader: sectionHeader,
    });

    return result;
  };  
};
