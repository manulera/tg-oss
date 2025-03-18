/**
 * test file for the ab1ToJson parser
 * @author Thomas Rich @tnrich
 */
import ab1ToJson from "../src/ab1ToJson";

import path from "path";
import fs from "fs";
import * as chai from "chai";
import example1OutputChromatogram from "./testData/ab1/example1_output_chromatogram.json";
chai.use(require("chai-things"));

chai.should();

// const exampleSequenceData = {
//   name: "example",
//   sequence: "ACGGTT",
//   circular: false,
//   extraLines: [],
//   type: "DNA",
//   size: 5299,
//   id: "jdosjio81",
//   chromatogramData: {
//     //       |  A     |  C     |  G     |  G     |  T     |  T     |
//     aTrace: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     cTrace: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     gTrace: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
//     tTrace: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
//     basePos: [1, 4, 7, 10, 13, 16],
//     baseCalls: ["A", "C", "G", "G", "T", "T"],
//     qualNums: [0.1, 0.2, 0.3, 0.3, 0.4, 0.4]
//   }
// };

describe("ab1 parser", function () {
  it("parse in an ab1 file without failing :)", async function () {
    const fileObj = fs.readFileSync(
      path.join(__dirname, "./testData/ab1/example1.ab1")
    );
    const res = await ab1ToJson(fileObj, { fileName: "example1.ab1" });

    res[0].parsedSequence.name.should.equal("example1");

    res[0].parsedSequence.chromatogramData.should.deep.equal(
      example1OutputChromatogram
    );
    res[0].parsedSequence.sequence.should.equal(
      "NANTCTATAGGCGAATTCGAGCTCGGTACCCGGGGATCCTCTAGAGTCGACCTGCAGGCATGCAAGCTTGAGTATTCTATAGTGTCACCTAAATAGCTTGGCGTAATCATGGTCATAGCTGTTTCCTGTGTGAAATTGTTATCCGCTCACAATTCCACACAACATACGAGCCGGAAGCATAAAGTGTAAAGCCTGGGGTGCCTAATGAGTGAGCTAACTCACATTAATTGCGTTGCGCTCACTGCCCGCTTTCCAGTCGGGAAACCTGTCGTGCCAGCTGCATTAATGAATCGGCCAACGCGCGGGGAGAGGCGGTTTGCGTATTGGGCGCTCTTCCGCTTCCTCGCTCACTGACTCGCTGCGCTCGGTCGTTCGGCTGCGGCGAGCGGTATCAGCTCACTCAAAGGCGGTAATACGGTTATCCACAGAATCAGGGGATAACGCAGGAAAGAACATGTGAGCAAAAGGCCAGCAAAAGGCCAGGAACCGTAAAAAGGCCGCGTTGCTGGCGTTTTTCCATAGGCTCCGCCCCCCTGACGAGCATCACAAAAATCGACGCTCAAGTCAGAGGTGGCGAAACCCGACAGGACTATAAAGATACCAGGCGTTTCCCCCTGGAAGCTCCCTCGTGCGCTCTCCTGTTCCGACCCTGCCGCTTACCGGATACCTGTCCGCCTTTCTCCCTTCGGGAAGCGTGGCGCTTTCTCATAGCTCACGCTGTAGGTATCTCAGTTCGGTGTAGGTCGTTCGCTCCAAGCTGGGCTGTGTGCACGAACCCCCCGTTCAGCCCGACCGCTGCGCCTTATCCGGTAACTATCGTCTTGAGTCCAACCCGGTAAGACACGACTTATCGCCACTGGCAGCAGCCACTGGTAACAGGATTAGCAGAGCGAGGTATGTAGGCGGTGCTACAGAGTTCTTGAAGTGGTGGCCTAACTACGGCTACACTAGAAGAACAGTATTTGGTATCTGCGCTCTGCTGAAGCCAGTTACCTTCGGAAAAAGAGTTGGTAGCTCTNGATCCGGCAACAACCACCGCTGGTAGCGGNGGTTTTTTGTTNGCAAGCAGCANATTACNCNCAAAAAAAAANGATCTCAANAAAATCCTTNGATNTTTTNNACGGGGNCTGACNCTNAGGGNAAAAAAACTCCCNTTAAGGGATTTNGNCNTGAANTTTNAAAAAGANNTTNCCCNAAAACNNTTNAATTAAAAAAANNTTTAAACNNCCNAAAAATTTNNAAAAAATTGNGGGGAANNNCCAGGNTTTNNTNGGGGGGCCCTNCCCCNNNGGGGTTTTTTTNCCCAAANGNGGCCCCCCCCCNGGNAAAAAAAANAANNGGGGNN"
    );
  });
  it.only("dummy manu example", async function () {
    // const fileObj = fs.readFileSync(
    //   path.join(__dirname, "./testData/ab1/example1.ab1")
    // );
    // const res = await ab1ToJson(fileObj, { fileName: "example1.ab1" });
    // const seq = res[0]
    // const data = convertBasePosTraceToPerBpTrace(exampleSequenceData.chromatogramData)
    // console.log(data.baseTraces);
    // console.log(seq.parsedSequence.chromatogramData.baseTraces[0]);
    // console.log(seq.parsedSequence.chromatogramData.baseTraces[1]);
  });
});
