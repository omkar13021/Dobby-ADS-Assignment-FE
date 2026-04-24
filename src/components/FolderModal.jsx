import { Modal, Input, Form } from 'antd';
import { useEffect } from 'react';

const FolderModal = ({ 
    open, 
    onCancel, 
    onSubmit, 
    loading, 
    mode, 
    initialName 
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.setFieldsValue({ name: mode === 'rename' ? initialName : '' });
        }
    }, [open, mode, initialName, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values.name);
        } catch (error) {
            // Validation failed
        }
    };

    const title = mode === 'create' ? 'Create Folder' : 'Rename Folder';
    const okText = mode === 'create' ? 'Create' : 'Rename';

    return (
        <Modal
            title={title}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            okText={okText}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Folder Name"
                    rules={[
                        { required: true, message: 'Please enter folder name' },
                        { min: 1, max: 100, message: 'Name must be 1-100 characters' }
                    ]}
                >
                    <Input 
                        placeholder="Enter folder name" 
                        autoFocus 
                        onPressEnter={handleOk}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default FolderModal;
