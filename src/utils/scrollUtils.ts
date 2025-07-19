export const scrollToElement = (
  elementId: string, 
  offset: number = 0, 
  behavior: ScrollBehavior = 'smooth'
) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior
    });
  }
};

export const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    behavior
  });
}; 