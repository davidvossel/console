/** https://github.com/coreos-inc/container-linux-update-operator/blob/master/internal/constants/constants.go **/
const containerLinuxUpdateOperatorPrefix = 'container-linux-update.v1.coreos.com/';

const isOperatorInstalled = (node) => {
  return _.has(node.metadata.labels, `${containerLinuxUpdateOperatorPrefix}id`);
};

const getStatus = (node) => {
  return _.get(node.metadata.annotations, `${containerLinuxUpdateOperatorPrefix}status`);
};

const getVersion = (node) => {
  return _.get(node.metadata.labels, `${containerLinuxUpdateOperatorPrefix}version`);
};

const getChannel = (node) => {
  return _.get(node.metadata.labels, `${containerLinuxUpdateOperatorPrefix}group`);
};

const getLastCheckedTime = (node) => {
  return _.get(node.metadata.annotations, `${containerLinuxUpdateOperatorPrefix}last-checked-time`);
};

const getNewVersion = (node) => {
  return _.get(node.metadata.annotations, `${containerLinuxUpdateOperatorPrefix}new-version`);
};

/** Whenever any node enters Downloading, Verifying, Finalizing **/
const isDownloading = (node) => {
  return _.includes('UPDATE_STATUS_DOWNLOADING', 'UPDATE_STATUS_VERIFYING',
    'UPDATE_STATUS_FINALIZING', getStatus(node)) ;
};

/** Whenever any node enters Updated_Need_Reboot **/
const isDownloadCompleted = (node) => {
  return getStatus(node) === 'UPDATE_STATUS_UPDATED_NEED_REBOOT';
};

const isRebooting = (node) => {
  const rebootInProgress =  _.get(node.metadata.annotations, `${containerLinuxUpdateOperatorPrefix}reboot-in-progress`, 'false');
  return rebootInProgress === 'true';
};

const isPendingReboot = (node) => {
  const rebootNeeded =  _.get(node.metadata.annotations, `${containerLinuxUpdateOperatorPrefix}reboot-needed`, 'false');
  return rebootNeeded === 'true';
};

const isSoftwareUpToDate = (node) => {
  const rebootNeeded =  _.get(node.metadata.annotations, `${containerLinuxUpdateOperatorPrefix}reboot-needed`, 'false');
  return getStatus(node) === 'UPDATE_STATUS_IDLE' && rebootNeeded === 'false';
};

const getUpdateStatus = (node) => {
  if (isSoftwareUpToDate(node)) {
    return { className: 'fa fa-check-circle co-cl-operator--up-to-date', text: 'Up to date'};
  }

  if (isDownloading(node)) {
    return { className: 'fa fa-info-circle co-cl-operator--pending', text: 'Downloading...'};
  }

  if (isRebooting(node)) {
    return { className: 'fa fa-info-circle co-cl-operator--pending', text: 'Rebooting...'};
  }

  if (isPendingReboot(node)) {
    return { className: 'fa fa-info-circle co-cl-operator--warning', text: 'Pending Reboot'};
  }
};

/** 'Download Completed' section:
Whenever a node enters a "Downloading", "Verifying", "Finalizing", light up (i.e. spinner shows up and showing "0 of [NodeNum]") the "Download Completed" section.
Only update/add up the node count for those reached to "Updated_Need_Reboot" state.
**/
const getDownloadCompletedIconClass = (nodeListUpdateStatus) => {
  return nodeListUpdateStatus.downloadCompleted.length === nodeListUpdateStatus.count ?
    'fa fa-check-circle co-cl-operator--downloaded' : 'fa fa-spin fa-circle-o-notch co-cl-operator-spinner--downloading';
};

/**
'Update Completed' section:
Whenever a node enters "Rebooting", light up (i.e. spinner shows up and showing "0 of [NodeNum]")
Only update/add up the node count for those up-to-date nodes.
**/
const getUpdateCompletedIconClass = (nodeListUpdateStatus) => {
  return nodeListUpdateStatus.rebooting.length === 0 ?
    'fa fa-fw fa-circle-o co-cl-operator--pending' : 'fa fa-spin fa-circle-o-notch co-cl-operator-spinner--rebooting';
};

const getNodeListUpdateStatus = (nodeList) => {
  let downloading = [];
  let upToDate = [];
  let rebooting = [];
  let downloadCompleted = [];

  _.each(nodeList, (node) => {
    if (isDownloading(node)) {
      downloading.push(node);
    } else if (isDownloadCompleted(node)) {
      downloadCompleted.push(node);
    } if (isSoftwareUpToDate(node)) {
      upToDate.push(node);
    } else if (isRebooting(node)) {
      rebooting.push(node);
    }
  });

  return {
    count: nodeList.length,
    overallState: downloading.length || rebooting.length ? 'Software is upgrading...' : 'Up to date',
    downloading,
    upToDate,
    rebooting,
    downloadCompleted
  };
};

export const containerLinuxUpdateOperator = {
  isOperatorInstalled,
  isSoftwareUpToDate,
  getUpdateStatus,
  getNodeListUpdateStatus,
  getVersion,
  getChannel,
  getNewVersion,
  getLastCheckedTime,
  getDownloadCompletedIconClass,
  getUpdateCompletedIconClass
};
