import type { Meta, StoryObj } from '@storybook/react';

import { fn } from '@storybook/test';

import SourceButton from './SourceButton.tsx';

export const ActionsData = {
    onClick: fn(),
};

const meta = {
    component: SourceButton,
    title: 'Source Button',
    tags: ['autodocs'],
    args: {
        variant : "invention",
    },
} satisfies Meta<typeof SourceButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Manufacturing: Story = {
    args: {
        variant: 'manufacturing',
        stateInit: 'suppressed',
    },
};

export const Invention: Story = {
    args: {
        variant: 'invention',
        stateInit: 'suppressed',
    },
};

export const Reaction: Story = {
    args: {
        variant: 'reaction',
        stateInit: 'suppressed',
    },
};

export const PI: Story = {
    args: {
        variant: 'pi',
        stateInit: 'suppressed',
    },
};

