import { ElMessage, ElMessageBox } from 'element-plus'

export const useMessage = () => {
  const message = {
    success: ElMessage.success,
    warning: ElMessage.warning,
    error: ElMessage.error,
    info: ElMessage.info,
    closeAll: ElMessage.closeAll
  }

  const messageBox = {
    alert: ElMessageBox.alert,
    confirm: ElMessageBox.confirm,
    prompt: ElMessageBox.prompt
  }

  return {
    $message: message,
    $messageBox: messageBox
  }
}
