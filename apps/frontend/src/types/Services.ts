

/**
 * The interface for the services object
 */

import PanelService from "@/components/viewer/viewport-1/service/PanelService";
import ViewportGridService from "@/components/viewer/viewport-1/service/ViewportGridService";

interface Services {
  // hangingProtocolService?: HangingProtocolService;
  // customizationService?: CustomizationService;
  // measurementService?: MeasurementService;
  // displaySetService?: DisplaySetService;
  // toolbarService?: ToolbarService;
  viewportGridService?: ViewportGridService;
  // uiModalService?: UIModalService;
  // uiNotificationService?: UINotificationService;
  // workflowStepsService: WorkflowStepsService;
  // cineService?: CineService;
  // userAuthenticationService?: UserAuthenticationService;
  // uiDialogService?: UIDialogService;
  // uiViewportDialogService?: UIViewportDialogService;
  panelService?: PanelService;
  // multiMonitorService?: MultiMonitorService;
}

export default Services;
