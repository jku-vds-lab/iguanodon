declare module "*.jpg";
declare module "*.png";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.svg";
declare module "*.html" {
  const content: string;
  export default content;
}