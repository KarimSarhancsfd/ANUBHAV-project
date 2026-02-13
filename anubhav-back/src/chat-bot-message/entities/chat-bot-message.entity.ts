import { ChatBot } from "src/chat-bot/entities/chat-bot.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class ChatBotMessage {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user_id: User

    @ManyToOne(() => ChatBot, (chatBot) => chatBot.id)
    @JoinColumn({ name: 'chat_bot_id' })
    chat_bot_id: ChatBot

    @Column()
    message: string

    @Column()
    record_url: string

    @Column()
    image_url: string

    @Column()
    archive: string

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date

    // @OneToOne(() => BookMarks, (bookMarks) => bookMarks.chat_bot_message_id)
    // bookmarks: BookMarks[]
}
