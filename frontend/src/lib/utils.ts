export function cn(...classes: (string | undefined | null | false)[]) {
  return classes
    .filter(Boolean)
    .join(' ')
    .split(' ')
    .filter((className, index, self) => 
      className && self.indexOf(className) === index
    )
    .join(' ');
}