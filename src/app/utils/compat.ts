import { Graph } from 'ngraph.graph';
import fromDot from 'ngraph.fromdot';
import { sha3_256 } from 'js-sha3';
import { GraphLink, GraphNode, Representation } from './appTypes';

export const parseGraphDOT = (
  dotString: string,
  forKey: string,
  rankingFilter: number,
) => {
  const graph: Graph = fromDot(dotString);

  const nodes: GraphNode[] = [];

  graph.forEachNode((node: any) => {
    const ranking = Number(node.data.ranking);
    const pubkey = node.data.pubkey as string;
    const plusCode = node.data.plusCode as string;
    const label = node.data.label as string;
    const catchment = node.data.catchment as string;

    if (forKey !== pubkey && rankingFilter / 100 > ranking) return;

    nodes.push({
      id: node.id,
      group: 1,
      label,
      pubkey,
      plusCode,
      ranking,
      catchment,
    });
  });

  const links: GraphLink[] = [];
  graph.forEachLink((link: any) => {
    const source = link.fromId;
    const target = link.toId;

    if (!nodes.map((n) => n.id).includes(source)) return;
    if (!nodes.map((n) => n.id).includes(target)) return;

    links.push({
      source,
      target,
      value: Number(link.data.weight),
    });
  });
  return { nodes, links };
};

// hex to base64
// Function to convert Hexadecimal to Base64
export function hexToBase64(hex: string): string {
  return btoa(
    hex
      .match(/\w{2}/g)!
      .map((byte) => String.fromCharCode(parseInt(byte, 16)))
      .join(''),
  );
}

// Function to convert Base64 to Hexadecimal
export function base64ToHex(base64: string): string {
  const binaryString = atob(base64);
  let hexResult = '';
  for (let i = 0; i < binaryString.length; i++) {
    const hex = binaryString.charCodeAt(i).toString(16);
    hexResult += hex.length === 2 ? hex : '0' + hex;
  }
  return hexResult.toUpperCase();
}

export const shortenPlotID = (value: string) => {
  const b64 = hexToBase64(value);

  return `${b64.substring(0, 7)}...${b64.substring(37)}`;
};

export const shortenHex = (value: string) => {
  return `${value.substring(0, 5)}...${value.substring(60)}`;
};

export const catchmentPrefix = (input: string) => {
  const split = input.split('/');
  const catchmentIndex = Number(split[0]);

  if (split.length < 2 || isNaN(catchmentIndex)) {
    return { isValid: false };
  }

  return { isValid: true, catchmentIndex };
};

export const shortenB64 = (value: string) => {
  const { isValid } = catchmentPrefix(value);

  return isValid || value.includes('//')
    ? value.replace(/0+=?$/g, '')
    : `${value.substring(0, 5)}...${value.substring(40)}`;
};

export const isPublicKeyPair = (input: string) =>
  !catchmentPrefix(input).isValid && !input.endsWith('0=');

export const representationID = (representation: Representation) => {
  const obj = {
    //IMPORTANT: The order here must be preserved when stringified for generating consistent hashes
    time: representation.time,
    nonce: representation.nonce,
    by: representation.by,
    for: representation.for,
    memo: representation.memo,
    series: representation.series,
  };

  const rep_hash = sha3_256(JSON.stringify(obj));

  return rep_hash;
};

export const getRepReference = ({ memo }: Representation) => {
  //"Example reference in memo looks like this: ref(xxxxhexadecimalxxxxxx)";

  const regex = /ref\(([a-fA-F0-9]+)\)/g;

  let match;
  const hexNumbers = [];

  while ((match = regex.exec(memo)) !== null) {
    hexNumbers.push(match[1]); // match[1] contains the hexadecimal part
  }

  return hexNumbers[0] ?? '';
};
