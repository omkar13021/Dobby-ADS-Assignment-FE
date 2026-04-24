import { Modal, Form, Input, message } from 'antd';

const CreateFolderModal = ({ open, onClose, onSubmit }) => {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values.name);
            form.resetFields();
        } catch (error) {
            message.error('Please enter a folder name');
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="Create New Folder"
            open={open}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText="Create"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Folder Name"
                    rules={[
                        { required: true, message: 'Please enter a folder name' },
                        { min: 1, max: 100, message: 'Name must be 1-100 characters' }
                    ]}
                >
                    <Input placeholder="Enter folder name" autoFocus />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateFolderModal;
