const printPlatformName = async (): Promise<void> => {
  const RepoFlowAsPrintableText: string = `
RRRRRR  EEEEEEE PPPPPP   OOOOO  FFFFFF L      OOOOO   W     W      SSSSS  Y     Y  N    N  CCCCCC
R    R  E       P    P  O     O F      L     O     O  W     W     S        Y   Y   N N  N  C     
RRRRRR  EEEE    PPPPPP  O     O FFFF   L     O     O  W  W  W      SSSSS     Y     N  N N  C     
R  R    E       P       O     O F      L     O     O  W W W W           S    Y     N   NN  C    
R   R   EEEEEEE P        OOOOO  F      LLLLL  OOOOO   W     W      SSSSS     Y     N    N  CCCCCC
`;

  console.log(RepoFlowAsPrintableText);
};

const AsciiArtManager = {
  printPlatformName,
};

export default AsciiArtManager;
