import { ValidateFuncReturn } from "@backend/managers/prerequisites/interface"
import { Progress } from "@backend/processors/events/interface"
import { addPrefixUnderscoreToObject } from "src/types/additions"

export type PrerequisitesEventsPromises = addPrefixUnderscoreToObject<{
    is_valid: () => ValidateFuncReturn,
    initialize: () => void
}, "prerequisites">

export type PrerequisitesMainToRender = addPrefixUnderscoreToObject<{
    update: (prog: Progress) => void
}, "prerequisites">