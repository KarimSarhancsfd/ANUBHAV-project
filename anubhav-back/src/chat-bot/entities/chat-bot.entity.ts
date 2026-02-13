import { Book } from "src/books/entities/book.entity";
import { ChatBotMessage } from "src/chat-bot-message/entities/chat-bot-message.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class ChatBot {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user_id: User

    @ManyToOne(() => Book, (book) => book.id)
    @JoinColumn({ name: 'book_id', referencedColumnName: 'id' })
    book_id: Book

    @Column()
    name: string

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date

    @OneToMany(() => ChatBotMessage, (chatBotMessage) => chatBotMessage.chat_bot_id)
    chatBotMessage: ChatBotMessage[]
}
