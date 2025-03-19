import createInitialSequence from "./utils/createInitialSequence";
import getArrayBufferFromFile from "./utils/getArrayBufferFromFile";

async function ab1ToJson(fileObj, options = {}) {
  const arrayBuffer = await getArrayBufferFromFile(fileObj);
  const dataview = new DataView(arrayBuffer);
  const converter = new abConverter(dataview);
  const chromatogramData = converter.getTraceData();
  const returnVal = createInitialSequence(options);
  returnVal.parsedSequence = {
    ...returnVal.parsedSequence,
    sequence: chromatogramData.baseCalls.join(""),
    chromatogramData
  };
  return [returnVal];
}

export default ab1ToJson;

function abConverter(inputArrayBuffer) {
  const dirLocation = inputArrayBuffer.getInt32(26);
  const numElements = inputArrayBuffer.getInt32(18);
  const lastEntry = dirLocation + numElements * 28;

  this.getNumber = (inOffset, numEntries) => {
    const retArray = [];
    for (let counter = 0; counter < numEntries; counter += 1) {
      retArray.push(inputArrayBuffer.getInt8(inOffset + counter));
    }
    return retArray;
  };

  this.getChar = (inOffset, numEntries) => {
    const retArray = [];
    for (let counter = 0; counter < numEntries; counter += 1) {
      retArray.push(
        String.fromCharCode(inputArrayBuffer.getInt8(inOffset + counter))
      );
    }
    return retArray;
  };

  this.getShort = (inOffset, numEntries) => {
    const retArray = [];
    for (let counter = 0; counter < numEntries; counter += 2) {
      retArray.push(inputArrayBuffer.getInt16(inOffset + counter));
    }
    return retArray;
  };

  this.getTagName = inOffset => {
    let name = "";
    for (let loopOffset = inOffset; loopOffset < inOffset + 4; loopOffset++) {
      name += String.fromCharCode(inputArrayBuffer.getInt8(loopOffset));
    }
    return name;
  };

  this.getDataTag = function (inTag) {
    let output;
    let curElem = dirLocation;
    do {
      const currTagName = this.getTagName(curElem);
      const tagNum = inputArrayBuffer.getInt32(curElem + 4);
      // eslint-disable-next-line eqeqeq
      if (currTagName == inTag.tagName && tagNum === inTag.tagNum) {
        const numEntries = inputArrayBuffer.getInt32(curElem + 16);
        const entryOffset = inputArrayBuffer.getInt32(curElem + 20);
        output = this[inTag.typeToReturn](entryOffset, numEntries);
      }
      curElem += 28;
    } while (curElem < lastEntry);
    return output;
  };

  this.getTraceData = function () {
    const traceData = {};
    traceData.aTrace = this.getDataTag(tagDict.colorDataA);
    traceData.tTrace = this.getDataTag(tagDict.colorDataT);
    traceData.gTrace = this.getDataTag(tagDict.colorDataG);
    traceData.cTrace = this.getDataTag(tagDict.colorDataC);
    traceData.basePos = this.getDataTag(tagDict.peakLocations);
    if (traceData.basePos === undefined) {
      traceData.basePos = this.getDataTag(tagDict.peakLocationsUser);
    }
    traceData.baseCalls = this.getDataTag(tagDict.baseCalls2);
    traceData.qualNums = this.getDataTag(tagDict.qualNums);
    if (traceData.qualNums) {
      //tnr if we're only getting 1's and 0's as qualNums, that means that there weren't actual qual nums attached to the file
      if (!traceData.qualNums.filter(q => q !== 1 && q !== 0).length) {
        delete traceData.qualNums;
      }
    }
    return convertBasePosTraceToPerBpTrace(traceData);
  };

  this.getFirstEntry = () => {
    let output = "";
    for (let curElem = dirLocation; curElem < lastEntry; curElem += 28) {
      let name = "";
      for (let offset = curElem; offset < curElem + 4; offset++) {
        name += String.fromCharCode(inputArrayBuffer.getInt8(offset));
      }
      output += ` - ${name}`;
    }
    return output;
  };
}

const tagDict = {
  baseCalls1: { tagName: "PBAS", tagNum: 1, typeToReturn: "getChar" },
  baseCalls2: { tagName: "PBAS", tagNum: 2, typeToReturn: "getChar" },
  qualNums: { tagName: "PCON", tagNum: 2, typeToReturn: "getNumber" },
  peakLocations: { tagName: "PLOC", tagNum: 2, typeToReturn: "getShort" },
  peakLocationsUser: { tagName: "PLOC", tagNum: 1, typeToReturn: "getShort" },
  peakDev: { tagName: "P1RL", tagNum: 1, typeToReturn: "getShort" },
  peakOneAmp: { tagName: "P1AM", tagNum: 1, typeToReturn: "getShort" },
  colorDataA: { tagName: "DATA", tagNum: 10, typeToReturn: "getShort" },
  colorDataT: { tagName: "DATA", tagNum: 11, typeToReturn: "getShort" },
  colorDataG: { tagName: "DATA", tagNum: 9, typeToReturn: "getShort" },
  colorDataC: { tagName: "DATA", tagNum: 12, typeToReturn: "getShort" }
};

// tnr: this function takes in chromData which has 4 traces and a basePos (which describes where in the trace the base call lands)
// It "normalizes" that data into a baseTraces array so that each base has its own set of that data (having a per-base trace makes insertion/deletion/copy/paste actions all easier)
function convertBasePosTraceToPerBpTrace(chromData) {
  const { basePos } = chromData;
  const binEdges = [0];
  basePos.forEach(pos => {
    binEdges.push(pos + 1);
  });

  const peakEdges = [0];
  for (let i = 0; i < basePos.length - 1; i++) {
    peakEdges.push(Math.ceil((basePos[i] + basePos[i + 1]) / 2));
  }
  peakEdges.push(chromData.aTrace.length);

  // Trim edges so that they are symmetric around the peak
  const firstBinWidth = peakEdges[1] - peakEdges[0];
  const secondBinWidth = peakEdges[2] - peakEdges[1];
  if (firstBinWidth > secondBinWidth) {
    peakEdges[0] = peakEdges[1] - secondBinWidth;
  }

  const lastBinWidth = peakEdges[peakEdges.length - 1] - peakEdges[peakEdges.length - 2];
  const secondLastBinWidth = peakEdges[peakEdges.length - 2] - peakEdges[peakEdges.length - 3];
  if (lastBinWidth > secondLastBinWidth) {
    peakEdges[peakEdges.length - 1] = peakEdges[peakEdges.length - 2] + secondLastBinWidth + 1;
  }

  // // Handle edge-case of last position (also trim)
  // const traceLength = chromData.aTrace.length;
  // binEdges[binEdges.length - 1] = traceLength + 1;
  // const lastBinWidth =
  //   binEdges[binEdges.length - 1] - binEdges[binEdges.length - 2];
  // const secondLastBinWidth =
  //   binEdges[binEdges.length - 2] - binEdges[binEdges.length - 3];
  // if (lastBinWidth > secondLastBinWidth) {
  //   binEdges[binEdges.length - 1] =
  //     binEdges[binEdges.length - 2] + secondLastBinWidth + 1;
  // }

  const baseTraces = [];
  for (let i = 0; i < peakEdges.length - 1; i++) {
    const start = peakEdges[i];
    const end = peakEdges[i + 1];
    const tracesForType = {
      aTrace: chromData.aTrace.slice(start, end),
      tTrace: chromData.tTrace.slice(start, end),
      gTrace: chromData.gTrace.slice(start, end),
      cTrace: chromData.cTrace.slice(start, end)
    };
    baseTraces.push(tracesForType);
  }

  return {
    baseTraces,
    ...chromData
  };
}

export { convertBasePosTraceToPerBpTrace };
