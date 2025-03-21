import { FocusStyleManager } from "@blueprintjs/core";
import { showContextMenu } from "@teselagen/ui";
import "./createVectorEditor";
import "./style.css";
export { getUserGroupLabel } from "./CutsiteFilter/AdditionalCutsiteInfoDialog";
window.tgCreateMenu = showContextMenu;
FocusStyleManager.onlyShowFocusOnTabs();
export { getGaps } from "./AlignmentView/getGaps";
export { default as createVectorEditor } from "./createVectorEditor";
export { default as withEditorProps, connectToEditor } from "./withEditorProps";
export { default as withEditorInteractions } from "./withEditorInteractions";
export { default as specialCutsiteFilterOptions } from "./constants/specialCutsiteFilterOptions";
//export components
export {
  default as CircularView,
  CircularView as CircularViewUnconnected
} from "./CircularView";
export { default as SimpleCircularOrLinearView } from "./SimpleCircularOrLinearView";
export { default as RowView, RowView as RowViewUnconnected } from "./RowView";
export { default as RowItem } from "./RowItem";
export { default as Editor, Editor as EditorUnconnected } from "./Editor";
export { ToolBar } from "./ToolBar";
export {
  default as CutsiteFilter,
  CutsiteFilter as CutsiteFilterUnconnected
} from "./CutsiteFilter";
export {
  default as LinearView,
  LinearView as LinearViewUnconnected
} from "./LinearView";
export {
  default as StatusBar,
  StatusBar as StatusBarUnconnected
} from "./StatusBar";
export {
  default as DigestTool,
  DigestTool as DigestToolUnconnected
} from "./DigestTool/DigestTool";
export { default as withHover } from "./helperComponents/withHover";

export {
  default as vectorEditorReducer,
  vectorEditorMiddleware,
  actions
} from "./redux";
export { default as updateEditor } from "./updateEditor";
export { default as addAlignment } from "./addAlignment";

export { default as getRangeAnglesSpecial } from "./CircularView/getRangeAnglesSpecial";
export { default as PositionAnnotationOnCircle } from "./CircularView/PositionAnnotationOnCircle";
export { default as EnzymeViewer } from "./EnzymeViewer";
export { default as AlignmentView } from "./AlignmentView";
export { default as getOveHotkeyDefs } from "./commands/getOveHotkeyDefs";
export { getStructuredBases } from "./RowItem/StackedAnnotations/getStructuredBases";
export { divideBy3 } from "./utils/proteinUtils";
