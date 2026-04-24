import { Dropdown } from 'antd';
import { 
    FolderOutlined, 
    FolderOpenOutlined,
    EditOutlined, 
    DeleteOutlined, 
    PlusOutlined,
    UploadOutlined 
} from '@ant-design/icons';

const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FolderNode = ({ 
    node, 
    isExpanded,
    onCreateFolder, 
    onRenameFolder, 
    onDeleteFolder,
    onUploadImage 
}) => {
    const menuItems = [
        {
            key: 'create',
            icon: <PlusOutlined />,
            label: 'New Folder',
            onClick: () => onCreateFolder(node)
        },
        {
            key: 'upload',
            icon: <UploadOutlined />,
            label: 'Upload Image',
            onClick: () => onUploadImage(node)
        },
        { type: 'divider' },
        {
            key: 'rename',
            icon: <EditOutlined />,
            label: 'Rename',
            onClick: () => onRenameFolder(node)
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Delete',
            danger: true,
            onClick: () => onDeleteFolder(node)
        }
    ];

    return (
        <Dropdown menu={{ items: menuItems }} trigger={['contextMenu']}>
            <span className="flex items-center gap-2 cursor-pointer select-none">
                {isExpanded ? (
                    <FolderOpenOutlined className="text-yellow-500" />
                ) : (
                    <FolderOutlined className="text-yellow-500" />
                )}
                <span>{node.name}</span>
                <span className="text-gray-400 text-xs ml-1">
                    ({formatSize(node.size || 0)})
                </span>
            </span>
        </Dropdown>
    );
};

export default FolderNode;
