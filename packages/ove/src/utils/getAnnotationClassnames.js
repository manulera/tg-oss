import classnames from "classnames";
import { upperFirst } from "lodash-es";

export default function getAnnotationClassnames(
  { overlapsSelf },
  { viewName, type }
) {
  const Type = upperFirst(type);
  return classnames(`ve${Type}`, `ve${viewName}${Type}`, {
    overlapsSelf
  });
}
