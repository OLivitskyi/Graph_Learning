declare module 'url' {
    export function parse(urlStr: string, parseQueryString?: boolean, slashesDenoteHost?: boolean): {
      href: string;
      protocol: string;
      slashes: boolean;
      auth: string;
      host: string;
      port: string;
      hostname: string;
      hash: string;
      search: string;
      query: string | { [key: string]: string | string[] };
      pathname: string;
      path: string;
    };
  
    export function format(urlObject: object): string;
  
    export function resolve(from: string, to: string): string;
  }
  