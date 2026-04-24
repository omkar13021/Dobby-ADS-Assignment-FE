import { Modal, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Dragger } = Upload;

const UploadModal = ({ 
    open, 
    onCancel, 
    onUpload, 
    loading,
    folderName 
}) => {
    const [fileList, setFileList] = useState([]);

    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning('Please select a file to upload');
            return;
        }

        try {
            for (const file of fileList) {
                await onUpload(file.originFileObj);
            }
            setFileList([]);
        } catch (error) {
            message.error('Upload failed');
        }
    };

    const handleCancel = () => {
        setFileList([]);
        onCancel();
    };

    const uploadProps = {
        multiple: true,
        fileList,
        beforeUpload: () => false,
        onChange: ({ fileList: newFileList }) => {
            setFileList(newFileList);
        },
        accept: 'image/*'
    };

    return (
        <Modal
            title={`Upload Images to "${folderName || 'Folder'}"`}
            open={open}
            onOk={handleUpload}
            onCancel={handleCancel}
            confirmLoading={loading}
            okText="Upload"
            width={520}
        >
            <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                    Click or drag images to this area
                </p>
                <p className="ant-upload-hint">
                    Support for single or bulk upload. Only image files allowed.
                </p>
            </Dragger>
        </Modal>
    );
};

export default UploadModal;
