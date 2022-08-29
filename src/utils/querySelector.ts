export const getByDataJs = (dataJs: string, element?: Element) => {
  if (element) {
    return element.querySelector(`[data-js="${dataJs}"]`)!;
  }
  return document.querySelector(`[data-js="${dataJs}"]`)!;
};

export const getAllByDataJs = (dataJs: string) => {
  return document.querySelectorAll(`[data-js="${dataJs}"]`)!;
};
