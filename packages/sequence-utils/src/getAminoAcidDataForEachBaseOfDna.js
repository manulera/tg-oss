import {
  translateRange,
  getSequenceWithinRange,
  flipContainedRange
} from "@teselagen/range-utils";
import revComp from "./getReverseComplementSequenceString";
import getAA from "./getAminoAcidFromSequenceTriplet";

//
import proteinAlphabet from "./proteinAlphabet";

function getTranslatedSequenceProperties(
  originalSequenceString,
  forward,
  optionalSubrangeRange,
  isProteinSequence
) {
  /*
    Returns a series of derived properties from the arguments to getAminoAcidDataForEachBaseOfDna
    * sequenceString:
      - If !isProtein: The subsequence within originalSequenceString that will be translated, defined by transaltionRange. If
        !forward, this will be the reverse complement of the subsequence.
      - If isProtein: The originalSequenceString.
    * translationRange: The range of the originalSequenceString that we're translating (if !isProtein), or getting DNA-level
      info for (if isProtein).
    * originalSequenceStringLength: The length of the full DNA sequence. If !isProtein it's the length of originalSequenceString
    * sequenceStringLength: The length of the DNA sequence that would give the translation.
  */

  const originalSequenceStringLength = isProteinSequence
    ? originalSequenceString.length * 3
    : originalSequenceString.length;

  let sequenceString = originalSequenceString;
  const translationRange = { start: 0, end: originalSequenceStringLength - 1 };

  if (optionalSubrangeRange) {
    sequenceString = getSequenceWithinRange(
      optionalSubrangeRange,
      originalSequenceString
    );
    translationRange.start = optionalSubrangeRange.start;
    translationRange.end = optionalSubrangeRange.end;
  }

  const sequenceStringLength = isProteinSequence
    ? sequenceString.length * 3
    : sequenceString.length;

  if (!isProteinSequence && !forward) {
    sequenceString = revComp(sequenceString);
  }

  // If a CDS has introns, make a list with the positions of the intron bases
  if (
    !isProteinSequence &&
    optionalSubrangeRange &&
    optionalSubrangeRange.positions
  ) {
    // TODO: Implement intronBases
    // const intronBases = [];
  }

  return {
    sequenceString,
    translationRange,
    sequenceStringLength,
    originalSequenceStringLength
  };
}

// ac.throw([ac.string,ac.bool],arguments);
/**
 * @private
 * Gets aminoAcid data, including position in string and position in codon
 * from the sequenceString and the direction of the translation
 * @param  {String} sequenceString The dna sequenceString.
 * @param  {boolean} forward Should we find forward facing orfs or reverse facing orfs
 * @param  {boolean} isProteinSequence We're passing in a sequence of AA chars instead of DNA chars (slightly confusing but we'll still use the dna indexing for rendering in OVE)
 * @return [{
        aminoAcid:
        positionInCodon:
      }]
 */
export default function getAminoAcidDataForEachBaseOfDna(
  originalSequenceString,
  forward,
  optionalSubrangeRange,
  isProteinSequence
) {
  // Obtain derived properties, see getTranslatedSequenceProperties
  const {
    sequenceString,
    translationRange,
    sequenceStringLength,
    originalSequenceStringLength
  } = getTranslatedSequenceProperties(
    originalSequenceString,
    forward,
    optionalSubrangeRange,
    isProteinSequence
  );

  // Function to get the codon range for a given index. The length of the codon
  // is normally 3, but in truncated sequences in can be less
  const getCodonRange = (index, size) => {
    let codonRange = translateRange(
      { start: index, end: index + size - 1 },
      translationRange.start,
      originalSequenceStringLength
    );
    if (!forward) {
      codonRange = flipContainedRange(
        codonRange,
        translationRange,
        originalSequenceStringLength
      );
    }
    return codonRange;
  };
  const getNextTriplet = index => {
    let triplet = "";
    let internalIndex = index;
    // Positions of codons relative to the coding sequence
    // including introns.
    const codonPositions = [];
    while (triplet.length < 3) {
      if (sequenceString[internalIndex]) {
        triplet += sequenceString[internalIndex];
        codonPositions.push(internalIndex);
        internalIndex++;
      } else {
        break;
      }
    }
    return { triplet, basesRead: internalIndex - index, codonPositions };
  };
  const aminoAcidDataForEachBaseOfDNA = [];
  // Iterate over the DNA sequence length in increments of 3
  for (let index = 0; index < sequenceStringLength; index += 3) {
    let aminoAcid;
    const aminoAcidIndex = index / 3;
    let basesRead = 3;
    let codonPositions;

    if (isProteinSequence) {
      codonPositions = [0, 1, 2].map(i => index + i);
      aminoAcid = proteinAlphabet[sequenceString[index / 3].toUpperCase()];
    } else {
      // Get the triplet of DNA bases
      const {
        triplet,
        basesRead: _basesRead,
        codonPositions: _codonPositions
      } = getNextTriplet(index);
      basesRead = _basesRead;
      codonPositions = _codonPositions;
      // If the triplet is not full, we need to add the gap xxx amino acid,
      // and break the loop
      if (triplet.length !== 3) {
        const truncatedCodonRange = getCodonRange(index, triplet.length);
        let sequenceIndexes = [
          truncatedCodonRange.start,
          truncatedCodonRange.end
        ];
        if (!forward) {
          sequenceIndexes = sequenceIndexes.reverse();
        }
        // We add one or two gap amino acids depending on the triplet length
        for (let j = 0; j < triplet.length; j++) {
          aminoAcidDataForEachBaseOfDNA.push({
            aminoAcid: getAA("xxx"), //fake xxx triplet returns the gap amino acid
            positionInCodon: j,
            aminoAcidIndex,
            sequenceIndex: sequenceIndexes[j],
            fullCodon: false,
            codonRange: truncatedCodonRange
          });
        }
        // We skip the rest of the loop and continue with the next iteration
        break;
      } else {
        aminoAcid = getAA(triplet);
        index += basesRead - 3;
        // TODO - add intron bases
        // if (index === 3) {
        //   aminoAcidDataForEachBaseOfDNA.push({});
        // }
      }
    }
    // TODO: rename getCodonRange
    const absoluteCodonPositions = codonPositions.map(
      i => getCodonRange(i, 1).start
    );
    const codonRange = forward
      ? { start: absoluteCodonPositions[0], end: absoluteCodonPositions[2] }
      : { start: absoluteCodonPositions[2], end: absoluteCodonPositions[0] };

    aminoAcidDataForEachBaseOfDNA.push({
      aminoAcid, //gap amino acid
      positionInCodon: 0,
      aminoAcidIndex,
      sequenceIndex: absoluteCodonPositions[0],
      codonRange,
      fullCodon: true
    });
    aminoAcidDataForEachBaseOfDNA.push({
      aminoAcid, //gap amino acid
      positionInCodon: 1,
      aminoAcidIndex,
      sequenceIndex: absoluteCodonPositions[1],
      codonRange,
      fullCodon: true
    });
    aminoAcidDataForEachBaseOfDNA.push({
      aminoAcid, //gap amino acid
      positionInCodon: 2,
      aminoAcidIndex,
      sequenceIndex: absoluteCodonPositions[2],
      codonRange,
      fullCodon: true
    });
  }

  if (sequenceStringLength !== aminoAcidDataForEachBaseOfDNA.length) {
    throw new Error("something went wrong!");
  }

  // Reverse the array if we're translating in the reverse direction
  if (!forward) {
    aminoAcidDataForEachBaseOfDNA.reverse();
  }
  return aminoAcidDataForEachBaseOfDNA;
}
